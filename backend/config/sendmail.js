const sgMail = require('@sendgrid/mail')
const fs = require('fs')

const { sendgrid_api_key } = require('../config/secret_keys')

sgMail.setApiKey(sendgrid_api_key)

const nullData = (data) => {
    if(!data) {
        const error = new Error("Error sending mail")
        error.statusCode = 500
        throw error
    };
    
}

// setting up email sending funtionality using sendgrid api
const resetPassword = async (userEmail, url, token) => {
    const redirectUrl = `http://localhost:443/${url}/?token=${token}`
    // change this to deployed url
    const msg = {
        to: userEmail,
        from: 'victorotubure7@gmail.com',
        subject: `Password reset for ${userEmail}`,
        html: `
            <strong> You have requested to reset your password ${userEmail} on our smepay web application </strong> 
            <br>
            <br>
            <p> Click <a href="${redirectUrl}"> change password </a> to reset now, expires in 30 minutes </p> 
            <p> If you did not make this request, please contact us on our website or reply to this email and we will be sure to get back to you in no time </p>
        `
        
    };
    
    const result = await sgMail.send(msg)
    nullData(result)

    return result
}
const sendInvoice = async (userEmail, invoiceLink) => {
    const msg = {
        to: userEmail,
        from: 'victorotubure7@gmail.com',
        subject: `Invoice created for ${userEmail}`,
        html: `
            <h3> You have successfully created an invoice with id: <strong> ${invoiceLink} </strong> on smepay app </h3>
            <br>
            <p> Please return to the smepay app to <a href="smepayonrender.com/smepay/invoice"> manage your invoice </a> and also add tons of items to your invoice </p>
            <p> You can also download your pdf by clicking on <a href="${invoiceLink}"> view PDF </a> to check </p>

            <p> Find attached the pdf of the invoice </p>
        `,
        // attachments: [
        //     {
                
        //         content: invoiceLink,
        //         filename: 'invoice.pdf',
        //         type: 'application/pdf',
        //         disposition: 'attachment'
        //     }
        // ]  
    };
    
    const result = await sgMail.send(msg)
    nullData(result)
}



module.exports = { resetPassword, sendInvoice }