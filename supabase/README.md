# Supabase auth setup (PetPals User website)

## Redirect URLs

In **Supabase Dashboard → Authentication → URL Configuration**, add these to **Redirect URLs**:

- `http://localhost:5173/reset-password`
- `https://seifateek.github.io/PetPals_User/reset-password`
- `https://petpals-kappa.vercel.app/reset-password` (if using Vercel)

Set **Site URL** to your primary deployment (e.g. `https://seifateek.github.io/PetPals_User/`).

## Reset password email template

1. Open **Authentication → Email Templates → Reset Password**.
2. Paste the HTML from `email-templates/reset-password.html`.
3. Save.

The template uses `{{ .ConfirmationURL }}`, which Supabase replaces with a link that includes the recovery token and redirects to `/reset-password` on this site.
