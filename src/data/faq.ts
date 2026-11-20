export type FaqGroup = { id: string; title: string; items: { q: string; a: string }[] };

export const faqGroups: FaqGroup[] = [
  { id: 'start', title: 'Getting started', items: [
    { q: 'Do I need an account?', a: 'No. You can start with just your name. There is no password to create.' },
    { q: 'What can I keep track of?', a: 'Movement, meals, water, routines, how you feel and the things you want to write down. You can also set personal goals and look back at your days on a calendar.' },
    { q: 'Do I have to use every part?', a: 'Not at all. Choose the parts that matter to you. Everything else will be there if you want it later.' },
    { q: 'Is Ovara a medical or fitness programme?', a: 'No. Ovara is a personal space for everyday notes and reflection. It does not give medical advice or create a training plan.' },
  ] },
  { id: 'data', title: 'Your information', items: [
    { q: 'Where is my information kept?', a: 'Your entries are saved on the device you use. They are not connected to an online Ovara account.' },
    { q: 'Can I use Ovara on another device?', a: 'Yes. Download a copy from Preferences, then import it into Ovara on the other device.' },
    { q: 'How do I keep a copy or start over?', a: 'Open Preferences to download a copy of your information or clear your space. Clearing it cannot be undone, so save a copy first if you might need it.' },
    { q: 'Who can see my notes?', a: 'Anyone who can access your browser profile on your device may be able to see them. Take care when using a shared computer.' },
  ] },
  { id: 'tracking', title: 'Everyday notes', items: [
    { q: 'Why is there no calorie target?', a: 'You can add an energy estimate to a meal if you want, but Ovara will never tell you how much to eat. You can use the Food page without numbers.' },
    { q: 'How much is a glass of water?', a: 'One glass is 250 ml. You can choose to see water in millilitres or fluid ounces, and set a daily target that feels right for you.' },
    { q: 'What happens to my routines at the end of the day?', a: 'Your daily check-ins start fresh, while your earlier check-ins stay in your history.' },
    { q: 'Can I change something after saving it?', a: 'Yes. You can edit activities, meal notes, routines, goals and journal notes. If you remove something by mistake, use Undo when it appears.' },
  ] },
  { id: 'reminders', title: 'Reminders', items: [
    { q: 'How do reminders work?', a: 'Choose the time and days that suit you in Preferences, then allow notifications when asked. Keep Ovara open around the time you have chosen and your reminder will appear.' },
    { q: 'Why did a reminder not appear?', a: 'Check that notifications are allowed for Ovara, that the reminder is switched on for that day and that Ovara is open around the time you chose.' },
  ] },
  { id: 'problems', title: 'If something does not look right', items: [
    { q: 'I cannot see my notes. Where did they go?', a: 'Your entries are saved on the device and in the browser where you added them. They may not appear if you switch browsers, use a private window or clear your browsing data. If you made a copy, you can restore it from Preferences.' },
    { q: 'The day or time looks wrong.', a: 'Ovara uses the date, time and time zone set on your device. Check those settings, then reload the page.' },
    { q: 'Why is a chart empty?', a: 'Charts reflect the entries you have added for the period you are viewing. For example, steps appear when you include a step count in an activity.' },
  ] },
];

export const homeFaq = [
  {
    q: 'What can I keep track of with Ovara?',
    a: 'Keep notes on movement, meals, water, routines and how you feel. You can also journal, set personal goals and see your days together on a calendar.',
  },
  {
    q: 'Can I choose which parts of Ovara to use?',
    a: 'Yes. Use the parts that feel useful to you and leave the rest aside. You can change what you focus on whenever you like.',
  },
  {
    q: 'Can I set goals that fit my life?',
    a: 'Yes. Set personal goals with a daily, weekly or monthly rhythm, choose a target that feels right and adjust it as your circumstances change.',
  },
  {
    q: 'Can I look back at my progress?',
    a: 'Yes. Your calendar and insights help you revisit earlier days and see how your activity, routines, water and reflections have taken shape over time.',
  },
  {
    q: 'Can I change something after I have saved it?',
    a: 'Yes. You can edit activities, meal notes, routines, goals and journal entries whenever you need to.',
  },
  {
    q: 'Can Ovara remind me about things?',
    a: 'Set reminders for the things you want to make time for, and choose the days and times that work for you.',
  },
];
