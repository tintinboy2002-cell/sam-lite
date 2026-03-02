var emailUtils = require(__base + "/utils/emailUtils.js");
var validations = require(__base + "/validations/validation.js");

function obj() {
  this.sendContactEmail = async function (req, res) {
    let response = {};
    let validationrule = {
      Name: "required",
      Mobile: "required",
      Email: "required",
      Subject: "required",
      Message: "required",
      nubax_email: "required",
      Address: "required",
      Qualification: "sometimes",
    };

    let validationobj = req.body;
    let isValid = await validations.validate(validationobj, validationrule);

    if (!isValid) {
      response["errors"] = global.errorMessage;
      let key = Object.keys(global.errorMessage)[0];
      response["message"] =
        global.errorMessage[key]?.message || "Something went wrong";
      response["status"] = "error";
      return response;
    }

    try {
      const {
        Name,
        Mobile,
        Email,
        Subject,
        Message,
        nubax_email,
        Address,
        Qualification,
      } = req.body;
      const resume = req.file

       if (!resume) {
        return res.status(400).json({
          status: "error",
          message: "CV is required",
        });
      }

      const emailBody = `
     <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f7fb; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.08); overflow:hidden;">
    
    <!-- Header -->
    <div style="background:#60C1AE; padding:18px 24px;">
      <h2 style="color:#ffffff; margin:0; font-size:20px;">✨ New Sign-Up Submission</h2>
    </div>

    <!-- Content -->
    <div style="padding:20px;">

      <p style="font-size:15px; color:#333; margin:0 0 15px;">You’ve received a new contact form submission:</p>

      <!-- Field Group -->
      <div style="width:100%; margin-bottom:12px;">
        <div style="font-weight:bold; color:#444; margin-bottom:3px;">👤 Name</div>
        <div style="padding-left:20px;">${Name}</div>
      </div>

      <div style="width:100%; margin-bottom:12px;">
        <div style="font-weight:bold; color:#444; margin-bottom:3px;">📞 Mobile</div>
        <div style="padding-left:20px;">${Mobile}</div>
      </div>

      <div style="width:100%; margin-bottom:12px;">
        <div style="font-weight:bold; color:#444; margin-bottom:3px;">📧 Email</div>
        <div style="padding-left:20px;"><a href="mailto:${Email}" style="color:#60C1AE; text-decoration:none;">${Email}</a></div>
      </div>

     <div style="width:100%; margin-bottom:12px;">
  <div style="font-weight:bold; color:#444; margin-bottom:3px;">📍 Address</div>
  <div style="padding-left:20px;">
    <a 
      href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        Address
      )}" 
      style="color:#60C1AE; text-decoration:none;" 
      target="_blank"
    >
      ${Address}
    </a>
  </div>
</div>


      <div style="width:100%; margin-bottom:12px;">
        <div style="font-weight:bold; color:#444; margin-bottom:3px;">🎓 Qualification</div>
        <div style="padding-left:20px;">${Qualification}</div>
      </div>

      <div style="width:100%; margin-bottom:12px;">
        <div style="font-weight:bold; color:#444; margin-bottom:3px;">🗂️ Subject</div>
        <div style="padding-left:20px;">${Subject}</div>
      </div>

      <div style="width:100%; margin-bottom:12px;">
        <div style="font-weight:bold; color:#444; margin-bottom:3px;">💬 Message</div>
        <div style="padding-left:20px;">${Message}</div>
      </div>

      <div style="margin-top:20px; border-top:1px solid #eee;"></div>

    </div>
  </div>
</div>

    `;

      await emailUtils.sendEmail(
        nubax_email,
        `New Sign-Up from ${Name}`,
        emailBody,
        resume
      );

      return { status: "success", message: "Email sent successfully." };
    } catch (error) {
      console.error("Error in sendContactEmail:", error);
      return {
        status: "error",
        message: "Something went wrong while sending email.",
      };
    }
  };
}
var self = (module.exports = new obj());
