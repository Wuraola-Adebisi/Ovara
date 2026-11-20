export type FaqGroup = { id: string; title: string; items: { q: string; a: string }[] };

export const faqGroups: FaqGroup[] = [
  { id: 'start', title: 'Getting started', items: [
    { q: 'Do I need an account?', a: 'No. Ovara asks for a name when you set up and an email address only if you want one shown. There is no password and nothing to verify.' },
    { q: 'What can I keep track of?', a: 'Activity, meals, water, routines, mood and a daily journal entry. You can also set goals, see insights and browse everything on a calendar.' },
    { q: 'Do I have to use every part?', a: 'No. At setup you choose the areas you care about and the Today page leads with them. The other pages stay available whenever you want them.' },
    { q: 'Is Ovara a medical or fitness programme?', a: 'No. It is a personal log. It does not give medical advice, set targets for your health or provide a training plan.' },
  ] },
  { id: 'data', title: 'Your data', items: [
    { q: 'Where is my data stored?', a: 'In your browser, on the device you use. Ovara has no accounts and does not send your entries to a server.' },
    { q: 'Can I use Ovara on a second device?', a: 'There is no live sync. You can download your data as a file on the Preferences page and restore it on another device with Restore from a file.' },
    { q: 'How do I back up or delete my data?', a: 'On the Preferences page, Download my data saves a JSON file and Reset my space deletes everything from this browser. Deleting cannot be undone.' },
    { q: 'Who can see my entries?', a: 'Anyone who can open your browser profile on your device. Because nothing is sent anywhere, there is no one else, but it also means a shared computer is not private.' },
  ] },
  { id: 'tracking', title: 'Tracking', items: [
    { q: 'Why is there no calorie target?', a: 'Ovara records energy only if you choose to enter it, and never tells you how much to eat. The Food page works without any numbers.' },
    { q: 'How much is a glass of water?', a: 'Each glass is 250 ml, shown in millilitres or fluid ounces depending on your preference. Your daily target is set on the Preferences page.' },
    { q: 'What happens to my routines at midnight?', a: 'The ticks reset for the new day and your history is kept. A routine counts as done when it has a check-in for that date.' },
    { q: 'Can I change an entry after saving it?', a: 'Yes. Activity, food notes, routines and goals can be edited, and journal entries can be rewritten for any past day. Anything you remove shows an Undo button for a few seconds.' },
  ] },
  { id: 'reminders', title: 'Reminders', items: [
    { q: 'How do reminders work?', a: 'Turn on a reminder on the Preferences page and allow notifications when your browser asks. Reminders appear while Ovara is open in a browser tab.' },
    { q: 'Why did a reminder not appear?', a: 'Check that notifications are allowed for this site in your browser, the reminder is switched on for that day, and a tab with Ovara is open. Reminders do not run after the tab is closed.' },
  ] },
  { id: 'problems', title: 'If something looks wrong', items: [
    { q: 'My entries disappeared. What happened?', a: 'Entries live in one browser on one device. They will not appear in a different browser, a private window or after clearing site data. If you have a downloaded file, restore it from the Preferences page.' },
    { q: 'The day or time looks wrong.', a: 'Ovara uses your device clock and time zone. Check both in your system settings, then reload the page.' },
    { q: 'A chart is empty.', a: 'Charts only show what you logged in that period. Steps appear once an activity has a step count, and water once you add a glass.' },
  ] },
];

export const homeFaq = [
  faqGroups[0].items[0], faqGroups[1].items[0], faqGroups[1].items[1], faqGroups[2].items[0], faqGroups[0].items[3], faqGroups[3].items[0],
];
