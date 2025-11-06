# **App Name**: Spartan Check-In

## Core Features:

- Visitor Check-In: Allows visitors to quickly check in by entering their information, capturing a photo, and providing GDPR consent. Saves data to Firestore.
- Contractor Check-In: Streamlines contractor check-in with added steps for site induction and rules agreement. Stores data in Firestore.
- Check-Out: Enables visitors and contractors to quickly check out by searching their name or badge ID. Records checkout time in Firestore.
- Admin Dashboard: Provides a secure, role-based admin dashboard with live stats, visitor and contractor logs, and reporting features.
- Settings Management: Allows root admins to manage app settings such as badge logo uploads, site name updates, and email notifications.
- Image and Logo Storage: Stores visitor photos and badge logos securely using Firebase Storage.
- Access Control: Use roles to determine if a user is allowed to view various parts of the app

## Style Guidelines:

- Primary color: Spartan IT Red (#E4002B) to align with the organization's branding. 
- Background color: Light Gray (#F0F0F0), a heavily desaturated shade of red, for a clean and modern backdrop. 
- Accent color: Dark Red (#A4001F), analogous to the primary, to provide contrast for calls to action.
- Font: 'Inter', a sans-serif font that is appropriate for both headers and body text in the app.
- Tablet-friendly design with rounded cards, large icons, and simple navigation optimized for touchscreen use.
- Left sidebar for admin pages, hidden when not logged in, to maintain a clean and focused user interface for guests.
- Use recognizable icons for all menu options. Icons should use the main color as appropriate, or grayscale variants.