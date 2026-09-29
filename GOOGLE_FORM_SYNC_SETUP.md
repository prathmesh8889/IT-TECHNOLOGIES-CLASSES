# Google Form → ITCYBER Admin Admissions

The Supabase side is already deployed.

Webhook:
`https://bvygcyllsdkqxjvdlrno.supabase.co/functions/v1/google-form-admission`

## One-time Google setup

1. Open the ITCYBER Google Form.
2. Open its Apps Script editor.
3. Replace the default script with the contents of `google-form-sync.gs`.
4. Save.
5. Run `installITCyberAdmissionSync` once.
6. Approve the Google permission prompt.
7. If the form already has old responses, run `syncExistingITCyberResponses` once.

After that every new form submission is sent automatically to Supabase and appears in:

**Admin → Admissions**

The integration stores:
- Name
- Phone
- Email
- Course / program
- Mode
- Message / timing, when present
- Submission source = `google-form`
- Google response ID for duplicate protection
- The complete original Google Form response as JSON

The webhook also uses the full original response in the Admin **Details** view, so extra Google Form questions are not lost.

## Important

Keep the function names unchanged because the installable trigger points to
`syncITCyberAdmission`.

The sync can safely import existing responses more than once. Google response IDs
are de-duplicated in Supabase.
