import axios from "axios";

/* ================= SEND STAFF EMAIL ================= */

const sendStaffCredentials = async ({
  name,
  email,
  username,
  password,
  role
}) => {

  console.log("\n");
  console.log("==================================");
  console.log("📧 STAFF EMAIL FUNCTION STARTED");
  console.log("==================================");

  console.log({
    name,
    email,
    username,
    password,
    role
  });

  try {

    const response = await axios.post(

      "https://api.brevo.com/v3/smtp/email",

      {

        sender: {

          name: "Omni Retail",

          email: "svasu18604@gmail.com"

        },

        to: [

          {

            email

          }

        ],

        subject:
          `Welcome ${name} - ${role} Credentials`,

        htmlContent: `

          <div style="
            background:#f4f7fb;
            padding:40px;
            font-family:Arial,sans-serif;
          ">

            <div style="
              max-width:650px;
              margin:auto;
              background:#ffffff;
              border-radius:18px;
              overflow:hidden;
              box-shadow:0 10px 30px rgba(0,0,0,0.08);
            ">

              <div style="
                background:linear-gradient(135deg,#2563eb,#1e40af);
                padding:35px;
                text-align:center;
              ">

                <h1 style="
                  color:white;
                  margin:0;
                ">
                  Omni Retail
                </h1>

                <p style="
                  color:#dbeafe;
                  margin-top:10px;
                ">
                  Staff Account Credentials
                </p>

              </div>

              <div style="
                padding:40px;
                color:#0f172a;
              ">

                <h2>
                  Welcome ${name}
                </h2>

                <p>
                  Your account has been created successfully.
                </p>

                <div style="
                  background:#f8fafc;
                  border:1px solid #e2e8f0;
                  border-radius:14px;
                  padding:25px;
                  margin-top:25px;
                ">

                  <p>
                    <strong>Role:</strong>
                    ${role}
                  </p>

                  <p>
                    <strong>Username:</strong>
                    ${username}
                  </p>

                  <p>
                    <strong>Password:</strong>
                    ${password}
                  </p>

                </div>

                <div style="
                  margin-top:30px;
                  background:#fef2f2;
                  border-left:5px solid #dc2626;
                  padding:18px;
                  border-radius:10px;
                ">

                  <strong>
                    IMPORTANT:
                  </strong>

                  Please change your password immediately using Forgot Password after first login.

                </div>

              </div>

            </div>

          </div>

        `

      },

      {

        headers: {

          accept: "application/json",

          "api-key":
            process.env.BREVO_API_KEY,

          "content-type":
            "application/json"

        }

      }

    );

    console.log("\n");
    console.log("==================================");
    console.log("✅ STAFF EMAIL SENT SUCCESSFULLY");
    console.log("==================================");

    console.log(response.data);

    return response.data;

  } catch (err) {

    console.log("\n");
    console.log("==================================");
    console.log("❌ STAFF EMAIL FAILED");
    console.log("==================================");

    console.log(
      err.response?.data ||
      err.message
    );

    return null;
  }

};

/* ================= EXPORT ================= */

export default sendStaffCredentials;