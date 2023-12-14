// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Resend } from 'resend';

import * as templates from "../../email-templates"

console.log("process.env.RESEND_API_KEY", process.env.RESEND_API_KEY)
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Process a POST request
    console.log(req.body)
    await sendEmail(req.body)
    return res.json({ message: "ok" })

  } else {
    // Handle any other HTTP method
  }
}

function bindTemplate(template, data) {

  let result = template;
  Object.keys(data).forEach((element) => {
    result = result.replace(new RegExp(`{{${element}}}`, 'g'), data[element]);
  });

  return result;
}

const sendEmail = async ({ targetName, targetRecipient, templateName, data }) => {

  const templateConfig = templates[templateName]

  const bindedHtml = bindTemplate(templateConfig.html, data)
  const bindedSubject = bindTemplate(templateConfig.subject, data)

  await resend.emails.send({
    from: `Wishlist - ${targetName} <onboarding@resend.dev>`,
    to: [targetRecipient,
      'pdiaz.btm@gmail.com'
    ],
    subject: bindedSubject,
    html: bindedHtml
  });
}



