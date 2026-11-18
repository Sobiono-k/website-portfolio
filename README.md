# Kiel Sobiono — Personal Portfolio

A responsive, static personal portfolio website built with HTML, CSS, and vanilla JavaScript. It can be deployed directly to Vercel without a build step.

## Run locally
Open `index.html` in your browser, or use the VS Code Live Server extension.

## Deploy to Vercel
1. Create a GitHub repository and upload the contents of this folder.
2. Go to https://vercel.com/new and import the repository.
3. Select **Other** as the framework preset if prompted.
4. Leave the build command and output directory empty/default (the site is static).
5. Click **Deploy**.

You can also deploy with the Vercel CLI from this folder:
```bash
npm i -g vercel
vercel
```

## Personalize before publishing
Search and replace these placeholders:
- `Kiel Sobiono` / `KIEL SOBIONO`: update the display name if you prefer another professional name.
- `YOUR_EMAIL@example.com`: replace with your professional email address.
- LinkedIn `href="#"`: add your LinkedIn profile URL or remove the link.
- Replace the portrait placeholder in `index.html` with your own photo.
- Add real screenshots and repository links for your projects.
- Confirm every skill and project description reflects your actual experience.

## Add your photo
Put your image in `assets/profile.jpg`, then replace the `.portrait-placeholder` block in `index.html` with:
```html
<img class="profile-photo" src="assets/profile.jpg" alt="Portrait of Kiel Sobiono">
```
Add this CSS:
```css
.profile-photo { width:100%; height:100%; object-fit:cover; object-position:center; }
```

No backend, database, or environment variables are required.
