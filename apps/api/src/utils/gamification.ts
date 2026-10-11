import { IStudentDocument } from '../models/Student';

export interface GamificationRewardResult {
  xpGained: number;
  newTotalXp: number;
  levelUp: boolean;
  newLevel: number;
  newBadgesAwarded: string[];
  streakDays: number;
}

/**
 * Calculates student level based on total XP (every 100 XP = 1 Level).
 */
export const calculateLevel = (totalXp: number): number => {
  return Math.floor(totalXp / 100) + 1;
};

/**
 * Updates student streak days based on current date.
 */
export const updateStreak = (student: IStudentDocument): number => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  if (!student.lastActiveDate) {
    student.streakDays = 1;
    student.lastActiveDate = today;
    return 1;
  }

  if (student.lastActiveDate === today) {
    return student.streakDays; // Already active today
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (student.lastActiveDate === yesterday) {
    student.streakDays += 1; // Consecutive active day
  } else {
    student.streakDays = 1; // Reset streak if missed days
  }

  student.lastActiveDate = today;
  return student.streakDays;
};

/**
 * Awards XP and checks for badges/level ups.
 */
export const awardXpAndBadges = async (
  student: IStudentDocument,
  xpAmount: number,
  actionType: 'lesson_complete' | 'quiz_pass' | 'project_submit',
): Promise<GamificationRewardResult> => {
  const oldLevel = student.level;
  const newTotalXp = student.xp + xpAmount;
  const newLevel = calculateLevel(newTotalXp);
  const levelUp = newLevel > oldLevel;

  const currentBadges = new Set(student.badges || []);
  const newBadgesAwarded: string[] = [];

  // Evaluate badge criteria
  if (actionType === 'lesson_complete' && !currentBadges.has('بطل الدرس الأول')) {
    currentBadges.add('بطل الدرس الأول');
    newBadgesAwarded.push('بطل الدرس الأول');
  }

  if (actionType === 'project_submit' && !currentBadges.has('مبتكر الألعاب')) {
    currentBadges.add('مبتكر الألعاب');
    newBadgesAwarded.push('مبتكر الألعاب');
  }

  if (student.streakDays >= 5 && !currentBadges.has('مواظب 5 أيام')) {
    currentBadges.add('مواظب 5 أيام');
    newBadgesAwarded.push('مواظب 5 أيام');
  }

  if (newLevel >= 5 && !currentBadges.has('مبرمج محترف')) {
    currentBadges.add('مبرمج محترف');
    newBadgesAwarded.push('مبرمج محترف');
  }

  // Update student profile
  student.xp = newTotalXp;
  student.level = newLevel;
  student.badges = Array.from(currentBadges);
  await student.save();

  return {
    xpGained: xpAmount,
    newTotalXp,
    levelUp,
    newLevel,
    newBadgesAwarded,
    streakDays: student.streakDays,
  };
};
