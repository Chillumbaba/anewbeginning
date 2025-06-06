import express from 'express';
import { GridData } from '../models/GridData';
import { Rule } from '../models/Rule';

const router = express.Router();

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
  console.log('GET /api/statistics - Starting request processing');
  try {
    const period = (req.query.period as string) || 'forever';
    console.log('Period:', period);
    const startDate = getStartDate(period);
    console.log('Start date:', startDate);

    // Get all active rules
    const activeRules = await Rule.find({ active: true });
    console.log('Active rules:', activeRules.length);
    const totalRules = activeRules.length;

    // Get all grid data
    const gridData = await GridData.find();
    console.log('Total grid data entries:', gridData.length);

    // Filter dates within the selected period
    const today = new Date();
    const filteredDates = [...new Set(gridData.map(data => {
      const [day, month] = data.date.split('/').map(Number);
      const date = new Date(today.getFullYear(), month - 1, day);
      return date >= startDate ? data.date : null;
    }))].filter(Boolean) as string[];

    console.log('Filtered dates:', filteredDates.length);
    const totalDays = filteredDates.length;

    // Calculate completion rate (treating blanks as crosses)
    const totalTicks = gridData
      .filter(data => {
        const [day, month] = data.date.split('/').map(Number);
        const date = new Date(today.getFullYear(), month - 1, day);
        return date >= startDate;
      })
      .filter(data => data.status === 'tick').length;

    console.log('Total ticks:', totalTicks);
    const totalPossibleTicks = totalRules * totalDays;
    const completionRate = totalPossibleTicks > 0 
      ? (totalTicks / totalPossibleTicks) * 100 
      : 0;

    // Calculate rule-specific progress
    const ruleProgress = await Promise.all(activeRules.map(async (rule) => {
      const ruleTicks = gridData
        .filter(data => {
          const [day, month] = data.date.split('/').map(Number);
          const date = new Date(today.getFullYear(), month - 1, day);
          return date >= startDate && data.rule === rule.number && data.status === 'tick';
        }).length;

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