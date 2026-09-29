export interface ScheduleStatus {
  isBreakfastSlot: boolean;
  isLunchSlot: boolean;
  canOrderBreakfast: boolean;
  canOrderLunch: boolean;
  canOrderAny: boolean;
  currentSlotName: string;
  nextSlotMessage: string;
  statusBadgeText: string;
  statusBadgeType: 'open' | 'closing_soon' | 'closed';
  currentTimeFormatted: string;
  cutoffWarning?: string;
  demoBypassActive: boolean;
}

// Convert "HH:MM" to minutes from midnight
function toMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

export function getCampusScheduleStatus(
  simulatedDate?: Date,
  demoBypassTiming: boolean = false
): ScheduleStatus {
  const now = simulatedDate || new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = toMinutes(currentHours, currentMinutes);

  // Format current time (e.g. "09:35 AM")
  const ampm = currentHours >= 12 ? 'PM' : 'AM';
  const displayHours = currentHours % 12 || 12;
  const displayMinutes = currentMinutes < 10 ? `0${currentMinutes}` : `${currentMinutes}`;
  const currentTimeFormatted = `${displayHours}:${displayMinutes} ${ampm}`;

  // 1. Breakfast Slot: 9:30 AM to 10:00 AM (570 to 600 mins)
  // Cutoff: 20 mins before 10:00 AM = 9:40 AM (580 mins)
  const breakfastStartMinutes = toMinutes(9, 30); // 9:30 AM (570)
  const breakfastDeliveryEndMinutes = toMinutes(10, 0); // 10:00 AM (600)
  const breakfastCutoffMinutes = toMinutes(9, 40); // 9:40 AM (580)

  // 2. Lunch Slot: 1:20 PM to 2:30 PM (800 to 870 mins)
  // Cutoff: 20 mins before 2:30 PM = 2:10 PM (850 mins)
  const lunchStartMinutes = toMinutes(13, 20); // 1:20 PM (800)
  const lunchDeliveryEndMinutes = toMinutes(14, 30); // 2:30 PM (870)
  const lunchCutoffMinutes = toMinutes(14, 10); // 2:10 PM (850)

  // Determine slot eligibility
  // Breakfast ordering window: 07:00 AM until 09:40 AM (cutoff)
  const isBreakfastSlot = currentTotalMinutes >= breakfastStartMinutes && currentTotalMinutes <= breakfastDeliveryEndMinutes;
  const canOrderBreakfast = demoBypassTiming || (currentTotalMinutes >= toMinutes(7, 0) && currentTotalMinutes <= breakfastCutoffMinutes);

  // Lunch ordering window: 10:00 AM until 02:10 PM (cutoff)
  const isLunchSlot = currentTotalMinutes >= lunchStartMinutes && currentTotalMinutes <= lunchDeliveryEndMinutes;
  const canOrderLunch = demoBypassTiming || (currentTotalMinutes >= toMinutes(10, 0) && currentTotalMinutes <= lunchCutoffMinutes);

  const canOrderAny = demoBypassTiming || canOrderBreakfast || canOrderLunch;

  let currentSlotName = 'Kitchen Closed';
  let nextSlotMessage = 'Next slot: Breakfast (9:30 - 10:00 AM)';
  let statusBadgeText = 'Ordering Closed';
  let statusBadgeType: 'open' | 'closing_soon' | 'closed' = 'closed';
  let cutoffWarning: string | undefined;

  if (demoBypassTiming) {
    currentSlotName = 'Demo / Testing Mode';
    statusBadgeText = '24/7 Demo Ordering Enabled';
    statusBadgeType = 'open';
    nextSlotMessage = 'Live testing bypass enabled. Orders accepted anytime.';
  } else if (canOrderBreakfast) {
    const minsLeft = breakfastCutoffMinutes - currentTotalMinutes;
    currentSlotName = 'Breakfast Ordering Window';
    if (minsLeft <= 15 && minsLeft > 0) {
      statusBadgeText = `Breakfast Closes in ${minsLeft}m!`;
      statusBadgeType = 'closing_soon';
      cutoffWarning = `Hurry! Breakfast orders close at 9:40 AM (${minsLeft} mins left)`;
    } else {
      statusBadgeText = 'Breakfast Orders Open (Closes 9:40 AM)';
      statusBadgeType = 'open';
    }
    nextSlotMessage = 'Breakfast Delivery: 9:30 AM - 10:00 AM';
  } else if (isBreakfastSlot && !canOrderBreakfast) {
    currentSlotName = 'Breakfast Delivery in Progress';
    statusBadgeText = 'Breakfast Orders Closed at 9:40 AM';
    statusBadgeType = 'closed';
    cutoffWarning = 'Breakfast ordering is closed (20-min pre-order cutoff passed). Deliveries in progress!';
    nextSlotMessage = 'Next slot: Lunch (1:20 PM - 2:30 PM, ordering opens till 2:10 PM)';
  } else if (canOrderLunch) {
    const minsLeft = lunchCutoffMinutes - currentTotalMinutes;
    currentSlotName = 'Lunch Ordering Window';
    if (minsLeft <= 15 && minsLeft > 0) {
      statusBadgeText = `Lunch Closes in ${minsLeft}m!`;
      statusBadgeType = 'closing_soon';
      cutoffWarning = `Hurry! Lunch orders close at 2:10 PM (${minsLeft} mins left)`;
    } else {
      statusBadgeText = 'Lunch Orders Open (Closes 2:10 PM)';
      statusBadgeType = 'open';
    }
    nextSlotMessage = 'Lunch Delivery: 1:20 PM - 2:30 PM';
  } else if (isLunchSlot && !canOrderLunch) {
    currentSlotName = 'Lunch Delivery in Progress';
    statusBadgeText = 'Lunch Orders Closed at 2:10 PM';
    statusBadgeType = 'closed';
    cutoffWarning = 'Lunch ordering is closed (20-min pre-order cutoff passed). Deliveries in progress!';
    nextSlotMessage = 'Kitchen re-opens tomorrow for Breakfast at 9:30 AM.';
  } else {
    currentSlotName = 'Orders Currently Closed';
    statusBadgeText = 'Ordering Closed';
    statusBadgeType = 'closed';
    if (currentTotalMinutes < breakfastStartMinutes) {
      nextSlotMessage = 'Breakfast orders open till 9:40 AM (Delivery 9:30 - 10:00 AM)';
    } else {
      nextSlotMessage = 'Lunch orders open till 2:10 PM (Delivery 1:20 - 2:30 PM)';
    }
  }

  return {
    isBreakfastSlot,
    isLunchSlot,
    canOrderBreakfast,
    canOrderLunch,
    canOrderAny,
    currentSlotName,
    nextSlotMessage,
    statusBadgeText,
    statusBadgeType,
    currentTimeFormatted,
    cutoffWarning,
    demoBypassActive: demoBypassTiming,
  };
}
