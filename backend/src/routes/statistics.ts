import express from 'express';
import { GridData } from '../models/GridData';
import { Rule } from '../models/Rule';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Helper function to get the start date for a given period
const getStartDate = (period: string): Date => {
  const today = new Date();
  switch (period) {
    case '1week':
      return new Date(today.setDate(today.getDate() - 7));
    case '1month':
      return new Date(today.setMonth(today.getMonth() - 1));
    case '3months':
      return new Date(today.setMonth(today.getMonth() - 3));
    case '6months':
      return new Date(today.setMonth(today.getMonth() - 6));
    case '1year':
      return new Date(today.setFullYear(today.getFullYear() - 1));
    default: // 'forever'
      return new Date(0); // Beginning of time
  }
};

// Debug middleware for this router
router.use((req, res, next) => {
  console.log('Statistics router middleware:', req.method, req.baseUrl + req.url);
  next();
});

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Statistics router is working' });
});

router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  console.log('GET /api/statistics - Starting request processing');
  try {
    const period = (req.query.period as string) || 'forever';
    console.log('Period:', period);
    const startDate = getStartDate(period);
    console.log('Start date:', startDate.toISOString());

    // Get all active rules for current user
    const activeRules = await Rule.find({ userId: (req.user as any)._id, active: true });
    console.log('Active rules:', activeRules.length);
    const totalRules = activeRules.length;

    // Get all grid data for current user
    const gridData = await GridData.find({ userId: (req.user as any)._id });
    console.log('Total grid data entries:', gridData.length);

    // Filter dates within the selected period
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    console.log('Today (end of day):', today.toISOString());

    // Get all unique dates from grid data
    const uniqueDates = [...new Set(gridData.map(data => data.date))];
    
    // Filter and sort dates within the period
    const filteredDates = uniqueDates
      .filter(dateStr => {
        const [day, month] = dateStr.split('/').map(Number);
        const date = new Date(today.getFullYear(), month - 1, day);
        date.setHours(12, 0, 0, 0); // Noon to avoid timezone issues
        return date >= startDate && date <= today;
      })
      .sort((a, b) => {
        const [dayA, monthA] = a.split('/').map(Number);
        const [dayB, monthB] = b.split('/').map(Number);
        const dateA = new Date(today.getFullYear(), monthA - 1, dayA);
        const dateB = new Date(today.getFullYear(), monthB - 1, dayB);
        return dateB.getTime() - dateA.getTime();
      });

    console.log('Filtered dates:', filteredDates);
    const totalDays = filteredDates.length;
    console.log('Total days:', totalDays);

    // Calculate completion rate
    let totalTicks = 0;
    const totalPossibleTicks = totalDays * totalRules;

    // For each date in the filtered period
    filteredDates.forEach(date => {
      // For each active rule
      activeRules.forEach(rule => {
        // Check if there's a tick for this rule on this date
        const hasTick = gridData.some(data => 
          data.date === date && 
          data.rule === rule.number && 
          data.status === 'tick'
        );
        if (hasTick) {
          totalTicks++;
        }
      });
    });

    console.log('Total ticks:', totalTicks);
    console.log('Total possible ticks:', totalPossibleTicks);
    const completionRate = totalPossibleTicks > 0 
      ? (totalTicks / totalPossibleTicks) * 100 
      : 0;
    console.log('Completion rate:', completionRate);

    // Calculate rule-specific progress
    const ruleProgress = await Promise.all(activeRules.map(async (rule) => {
      let ruleTicks = 0;
      filteredDates.forEach(date => {
        const hasTick = gridData.some(data => 
          data.date === date && 
          data.rule === rule.number && 
          data.status === 'tick'
        );
        if (hasTick) {
          ruleTicks++;
        }
      });

      const ruleCompletionRate = totalDays > 0 ? (ruleTicks / totalDays) * 100 : 0;

      return {
        ruleNumber: rule.number,
        ruleName: rule.name,
        completionRate: ruleCompletionRate,
        totalTicks: ruleTicks
      };
    }));

    // Calculate current streak
    let streakCount = 0;
    const sortedDates = filteredDates.sort((a, b) => {
      const [dayA, monthA] = a.split('/').map(Number);
      const [dayB, monthB] = b.split('/').map(Number);
      const dateA = new Date(today.getFullYear(), monthA - 1, dayA);
      const dateB = new Date(today.getFullYear(), monthB - 1, dayB);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate streak
    for (const date of sortedDates) {
      const dayData = gridData.filter(data => data.date === date);
      const allRulesCompleted = activeRules.every(rule => 
        dayData.some(data => data.rule === rule.number && data.status === 'tick')
      );

      if (allRulesCompleted) {
        streakCount++;
      } else {
        break;
      }
    }

    const response = {
      totalRules,
      totalDays,
      completionRate,
      streakCount,
      period,
      ruleProgress,
      totalTicks,
      totalPossibleTicks
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({ 
      message: 'Error calculating statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 