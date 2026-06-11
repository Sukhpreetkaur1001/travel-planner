const nodemailer = require('nodemailer')

const emailUser = process.env.EMAIL_USER
const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, '')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
})

const sendMail = async (options) => {
  await transporter.sendMail({
    from: `"Travel Planner" <${emailUser}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  })
}

module.exports = sendMail
