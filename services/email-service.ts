import { Resend } from "resend"

const resend = new Resend(
    process.env.RESEND_API_KEY
)

export async function sendMonthlyReport(
    email: string,
    report: string
) {
    try {
        await resend.emails.send({
            from:
                "SmartExpense AI <onboarding@resend.dev>",

            to: email,

            subject:
                "📊 Your AI Financial Report is Ready",

            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />

<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<title>SmartExpense AI Report</title>
</head>

<body style="
margin:0;
padding:0;
background:#050816;
font-family:Inter,Arial,sans-serif;
color:white;
">

<div style="
max-width:700px;
margin:0 auto;
padding:40px 20px;
">

    <!-- HEADER -->

    <div style="
    background:
        linear-gradient(
            135deg,
            rgba(124,58,237,0.18),
            rgba(6,182,212,0.12)
        );

    border:
        1px solid rgba(255,255,255,0.08);

    border-radius:32px;

    padding:50px 40px;

    backdrop-filter:blur(20px);

    overflow:hidden;

    position:relative;
    ">

        <!-- Glow -->

        <div style="
        position:absolute;
        top:-100px;
        right:-100px;
        width:240px;
        height:240px;
        background:rgba(124,58,237,0.25);
        filter:blur(100px);
        border-radius:999px;
        "></div>

        <!-- Logo -->

        <div style="
        width:72px;
        height:72px;
        border-radius:24px;
        background:
            linear-gradient(
                135deg,
                #7c3aed,
                #06b6d4
            );

        display:flex;
        align-items:center;
        justify-content:center;

        font-size:28px;
        font-weight:bold;

        margin-bottom:30px;
        ">
            AI
        </div>

        <!-- Title -->

        <p style="
        color:#67e8f9;
        font-size:13px;
        font-weight:600;
        letter-spacing:0.25em;
        text-transform:uppercase;
        margin-bottom:18px;
        ">
            Smart Financial Intelligence
        </p>

        <h1 style="
        font-size:44px;
        line-height:1.1;
        margin:0;
        font-weight:900;
        letter-spacing:-0.03em;
        ">
            Your Monthly AI Financial Report
        </h1>

        <p style="
        color:#cbd5e1;
        font-size:18px;
        line-height:1.8;
        margin-top:24px;
        max-width:560px;
        ">
            Your personalized financial analytics and AI-generated spending insights are now ready.
        </p>
    </div>

    <!-- SPACING -->

    <div style="height:28px;"></div>

    <!-- REPORT CARD -->

    <div style="
    background:rgba(255,255,255,0.04);

    border:
        1px solid rgba(255,255,255,0.08);

    border-radius:32px;

    padding:40px;

    backdrop-filter:blur(20px);
    ">

        <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:28px;
        flex-wrap:wrap;
        gap:20px;
        ">

            <div>
                <p style="
                color:#a5b4fc;
                font-size:13px;
                letter-spacing:0.2em;
                text-transform:uppercase;
                margin-bottom:10px;
                ">
                    AI Generated Report
                </p>

                <h2 style="
                margin:0;
                font-size:32px;
                font-weight:800;
                ">
                    Financial Overview
                </h2>
            </div>

            <div style="
            padding:14px 22px;
            border-radius:20px;
            background:
                linear-gradient(
                    135deg,
                    #7c3aed,
                    #06b6d4
                );

            font-weight:600;
            font-size:14px;
            ">
                Premium Analytics
            </div>
        </div>

        <!-- CONTENT -->

        <div style="
        background:#0f172a;

        border:
            1px solid rgba(255,255,255,0.06);

        border-radius:24px;

        padding:30px;

        color:#e2e8f0;

        font-size:16px;

        line-height:1.9;

        white-space:pre-wrap;
        ">
${report}
        </div>
    </div>

    <!-- STATS -->

    <div style="
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
    gap:18px;
    margin-top:28px;
    ">

        <div style="
        background:rgba(34,197,94,0.08);
        border:1px solid rgba(34,197,94,0.18);
        border-radius:24px;
        padding:28px;
        ">
            <p style="
            color:#86efac;
            font-size:14px;
            margin-bottom:12px;
            ">
                Savings Intelligence
            </p>

            <h3 style="
            margin:0;
            font-size:24px;
            font-weight:800;
            color:white;
            ">
                AI Optimized
            </h3>
        </div>

        <div style="
        background:rgba(6,182,212,0.08);
        border:1px solid rgba(6,182,212,0.18);
        border-radius:24px;
        padding:28px;
        ">
            <p style="
            color:#67e8f9;
            font-size:14px;
            margin-bottom:12px;
            ">
                Spending Analytics
            </p>

            <h3 style="
            margin:0;
            font-size:24px;
            font-weight:800;
            color:white;
            ">
                Smart Tracking
            </h3>
        </div>

        <div style="
        background:rgba(124,58,237,0.08);
        border:1px solid rgba(124,58,237,0.18);
        border-radius:24px;
        padding:28px;
        ">
            <p style="
            color:#c4b5fd;
            font-size:14px;
            margin-bottom:12px;
            ">
                Financial Health
            </p>

            <h3 style="
            margin:0;
            font-size:24px;
            font-weight:800;
            color:white;
            ">
                AI Monitored
            </h3>
        </div>
    </div>

    <!-- FOOTER -->

    <div style="
    text-align:center;
    margin-top:50px;
    padding-top:30px;
    border-top:1px solid rgba(255,255,255,0.08);
    ">

        <p style="
        color:#94a3b8;
        font-size:15px;
        line-height:1.8;
        ">
            Generated by <strong style="color:white;">SmartExpense AI</strong><br/>
            Premium AI-powered financial intelligence platform
        </p>

        <p style="
        color:#64748b;
        font-size:13px;
        margin-top:18px;
        ">
            © ${new Date().getFullYear()} SmartExpense AI. All rights reserved.
        </p>
    </div>

</div>

</body>
</html>
`,
        })

        return true
    } catch (error) {
        console.error(error)

        return false
    }
}