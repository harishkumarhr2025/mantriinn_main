export const WelcomeEmail = ({ guest_name, room_no, arrival_date, grc_no }) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f5f5;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px;">
        <!-- Header -->
        <tr>
            <td style="padding: 30px 25px; background: #2A5C97; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">Mantri In</h1>
                <p style="color: #cce4ff; margin: 8px 0 0 0; font-size: 15px;">Where Comfort Meets Hospitality</p>
            </td>
        </tr>

        <!-- Welcome Body -->
        <tr>
            <td style="padding: 35px 30px;">
                <h2 style="color: #2A5C97; margin: 0 0 10px 0; font-size: 22px;">Welcome, ${guest_name}! 🎉</h2>
                <p style="color: #444; line-height: 1.7; margin: 0 0 20px 0;">
                    We are delighted to have you with us. Your check-in has been successfully recorded and we are ready to make your stay a memorable one.
                </p>

                <!-- Stay Details -->
                <div style="background: #f0f6ff; border-left: 4px solid #2A5C97; padding: 20px; border-radius: 0 6px 6px 0; margin-bottom: 25px;">
                    <h3 style="color: #2A5C97; margin: 0 0 12px 0; font-size: 16px;">Your Stay Details</h3>
                    <table width="100%">
                        <tr>
                            <td style="padding: 6px 0; color: #666; width: 45%;">Booking Reference:</td>
                            <td style="padding: 6px 0; font-weight: bold; color: #333;">#${grc_no}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #666;">Room Number:</td>
                            <td style="padding: 6px 0; color: #333;">${room_no}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #666;">Arrival Date:</td>
                            <td style="padding: 6px 0; color: #333;">${arrival_date}</td>
                        </tr>
                    </table>
                </div>

                <!-- Message -->
                <p style="color: #444; line-height: 1.7; margin: 0 0 15px 0;">
                    If you need any assistance during your stay, please do not hesitate to reach out to our front desk. We are here 24/7 to ensure your comfort.
                </p>
                <p style="color: #444; line-height: 1.7; margin: 0;">
                    We hope you have a wonderful stay with us!
                </p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="padding: 20px 25px; background: #f8f9fa; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #888; font-size: 13px;">Mantri In &nbsp;|&nbsp; Warm hospitality, every stay</p>
            </td>
        </tr>
    </table>
</body>
</html>`;
};
