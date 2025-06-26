import express, { Request, Response } from 'express';
import { GridData } from '../models/GridData';
import { Rule } from '../models/Rule';
import { authenticateToken } from '../middleware/auth';

interface AuthenticatedRequest extends Request {
  user?: any;
}

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

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  console.log('GET /api/statistics - Starting request processing');
  try {
    const period = (req.query.period as string) || 'forever';
    console.log('Period:', period);

    // Get all active rules for current user
    const activeRules = await Rule.find({ userId: (req.user as any)._id, active: true });
    console.log('Active rules:', activeRules.length);
    const totalRules = activeRules.length;

    if (totalRules === 0) {
      return res.json({
        totalRules: 0,
        totalDays: 0,
        completionRate: 0,
        streakCount: 0,
        period,
        ruleProgress: [],
        totalTicks: 0,
        totalPossibleTicks: 0
      });
    }

    // Get all grid data for current user
    const gridData = await GridData.find({ userId: (req.user as any)._id });
    console.log('Total grid data entries:', gridData.length);

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    // Find the oldest rule createDate (using createDate field, fallback to createdAt)
    let oldestRuleDate = new Date(today);
    activeRules.forEach(rule => {
      const ruleCreateDate = rule.createDate || (rule as any).createdAt;
      if (ruleCreateDate < oldestRuleDate) {
        oldestRuleDate = new Date(ruleCreateDate);
      }
    });
    oldestRuleDate.setHours(0, 0, 0, 0); // Start of day

    console.log('Oldest rule date:', oldestRuleDate.toISOString());

    // Apply period filter to the oldest rule date
    const periodStartDate = getStartDate(period);
    const effectiveStartDate = period === 'forever' ? oldestRuleDate : new Date(Math.max(oldestRuleDate.getTime(), periodStartDate.getTime()));
    
    console.log('Effective start date:', effectiveStartDate.toISOString());

    // Generate all date strings from effective start date to today
    const allDateStrings: string[] = [];
    let currentDate = new Date(effectiveStartDate);
    while (currentDate <= today) {
      const dateStr = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      allDateStrings.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Use actual count of generated dates for accuracy
    const totalDays = allDateStrings.length;
    console.log('Total days tracked:', totalDays);
    console.log('Generated date strings:', allDateStrings.length);

    // Calculate overall progress: total ticks / total possible cells
    let totalTicks = 0;
    let totalPossibleCells = 0;

    allDateStrings.forEach(dateStr => {
      activeRules.forEach(rule => {
        // Check if this rule was active on this date (rule must exist before or on this date)
        const ruleDateStr = dateStr.split('/');
        const checkDate = new Date(today.getFullYear(), parseInt(ruleDateStr[1]) - 1, parseInt(ruleDateStr[0]));
        const ruleCreateDate = new Date(rule.createDate || (rule as any).createdAt);
        ruleCreateDate.setHours(0, 0, 0, 0);
        
        if (checkDate >= ruleCreateDate) {
          totalPossibleCells++;
          
          // Check if there's a tick for this rule on this date
          const hasTick = gridData.some(data => 
            data.date === dateStr && 
            data.rule === rule.number && 
            data.status === 'tick'
          );
          if (hasTick) {
            totalTicks++;
          }
        }
      });
    });

    const completionRate = totalPossibleCells > 0 ? (totalTicks / totalPossibleCells) * 100 : 0;
    console.log('Total ticks:', totalTicks, 'Total possible cells:', totalPossibleCells, 'Completion rate:', completionRate);

    // Calculate rule-specific progress
    const ruleProgress = activeRules.map((rule) => {
      const ruleCreateDate = new Date(rule.createDate || (rule as any).createdAt);
      ruleCreateDate.setHours(0, 0, 0, 0);
      
      // Apply period filter for this rule
      const ruleEffectiveStartDate = period === 'forever' ? ruleCreateDate : new Date(Math.max(ruleCreateDate.getTime(), periodStartDate.getTime()));
      
      // Count ticks for this rule in the effective period
      let ruleTicks = 0;
      let rulePossibleCells = 0;
      
      // Generate date strings for this rule's period
      let ruleCurrentDate = new Date(ruleEffectiveStartDate);
      while (ruleCurrentDate <= today) {
        const ruleDateStr = ruleCurrentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        rulePossibleCells++;
        
        const hasTick = gridData.some(data => 
          data.date === ruleDateStr && 
          data.rule === rule.number && 
          data.status === 'tick'
        );
        if (hasTick) {
          ruleTicks++;
        }
        
        ruleCurrentDate.setDate(ruleCurrentDate.getDate() + 1);
      }

      // Use actual count of generated dates for this rule
      const ruleEffectiveDays = rulePossibleCells;
      const ruleCompletionRate = rulePossibleCells > 0 ? (ruleTicks / rulePossibleCells) * 100 : 0;

      return {
        ruleNumber: rule.number,
        ruleName: rule.name,
        completionRate: ruleCompletionRate,
        totalTicks: ruleTicks,
        totalDays: ruleEffectiveDays,
        possibleCells: rulePossibleCells
      };
    });

    // Calculate current streak (consecutive days where all rules have ticks)
    let streakCount = 0;
    const sortedDateStrings = [...allDateStrings].reverse(); // Most recent first

    for (const dateStr of sortedDateStrings) {
      // Check if all active rules that existed on this date have ticks
      let allRulesCompleted = true;
      
      for (const rule of activeRules) {
        const ruleDateParts = dateStr.split('/');
        const checkDate = new Date(today.getFullYear(), parseInt(ruleDateParts[1]) - 1, parseInt(ruleDateParts[0]));
        const ruleCreateDate = new Date(rule.createDate || (rule as any).createdAt);
        ruleCreateDate.setHours(0, 0, 0, 0);
        
        // Only check rules that existed on this date
        if (checkDate >= ruleCreateDate) {
          const hasTick = gridData.some(data => 
            data.date === dateStr && 
            data.rule === rule.number && 
            data.status === 'tick'
          );
          if (!hasTick) {
            allRulesCompleted = false;
            break;
          }
        }
      }

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
      totalPossibleTicks: totalPossibleCells
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