import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { application, applicationId } = await req.json()

    // Format the email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
            .field { margin: 8px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .value { margin-left: 10px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Loan Application Received</h1>
              <p>Application ID: ${applicationId}</p>
            </div>

            <div class="section">
              <div class="section-title">Contact Information</div>
              <div class="field"><span class="label">Email:</span><span class="value">${application.email}</span></div>
              ${application.loan_officer ? `<div class="field"><span class="label">Loan Officer:</span><span class="value">${application.loan_officer}</span></div>` : ''}
            </div>

            <div class="section">
              <div class="section-title">Business Information</div>
              <div class="field"><span class="label">Business Name:</span><span class="value">${application.business_name}</span></div>
              ${application.rc_number ? `<div class="field"><span class="label">RC Number:</span><span class="value">${application.rc_number}</span></div>` : ''}
              ${application.business_since ? `<div class="field"><span class="label">Business Since:</span><span class="value">${application.business_since}</span></div>` : ''}
              ${application.business_address ? `<div class="field"><span class="label">Business Address:</span><span class="value">${application.business_address}</span></div>` : ''}
              ${application.num_shops ? `<div class="field"><span class="label">Number of Shops:</span><span class="value">${application.num_shops}</span></div>` : ''}
            </div>

            <div class="section">
              <div class="section-title">Personal Information</div>
              <div class="field"><span class="label">Representative Name:</span><span class="value">${application.representative_name}</span></div>
              <div class="field"><span class="label">Gender:</span><span class="value">${application.gender}</span></div>
              ${application.marital_status ? `<div class="field"><span class="label">Marital Status:</span><span class="value">${application.marital_status}</span></div>` : ''}
              ${application.home_address ? `<div class="field"><span class="label">Home Address:</span><span class="value">${application.home_address}</span></div>` : ''}
              ${application.bvn ? `<div class="field"><span class="label">BVN:</span><span class="value">${application.bvn}</span></div>` : ''}
              ${application.tin ? `<div class="field"><span class="label">TIN:</span><span class="value">${application.tin}</span></div>` : ''}
              ${application.annual_salary ? `<div class="field"><span class="label">Annual Salary:</span><span class="value">₦${parseFloat(application.annual_salary).toLocaleString()}</span></div>` : ''}
            </div>

            ${application.phone_numbers && application.phone_numbers.length > 0 ? `
            <div class="section">
              <div class="section-title">Phone Numbers</div>
              ${application.phone_numbers.map((phone: string) => `<div class="field">• ${phone}</div>`).join('')}
              ${application.spouse_phone ? `<div class="field"><span class="label">Spouse Phone:</span><span class="value">${application.spouse_phone}</span></div>` : ''}
            </div>
            ` : ''}

            ${application.warehouses && application.warehouses.length > 0 ? `
            <div class="section">
              <div class="section-title">Warehouses</div>
              ${application.warehouses.map((w: any, i: number) => `
                <div class="field">
                  <strong>Warehouse ${i + 1}:</strong> 
                  ${w.number ? `Number: ${w.number}` : ''} 
                  ${w.address ? `- Address: ${w.address}` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${application.parking_stores && application.parking_stores.length > 0 ? `
            <div class="section">
              <div class="section-title">Parking Stores</div>
              ${application.parking_stores.map((s: any, i: number) => `
                <div class="field">
                  <strong>Store ${i + 1}:</strong> 
                  ${s.number ? `Number: ${s.number}` : ''} 
                  ${s.address ? `- Address: ${s.address}` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}

            <div class="section">
              <div class="section-title">Loan Details</div>
              <div class="field"><span class="label">Loan Type:</span><span class="value">${application.loan_type}</span></div>
              <div class="field"><span class="label">Loan Amount:</span><span class="value">₦${parseFloat(application.loan_amount).toLocaleString()}</span></div>
              ${application.duration_months ? `<div class="field"><span class="label">Duration:</span><span class="value">${application.duration_months} months</span></div>` : ''}
              ${application.repayment_capacity ? `<div class="field"><span class="label">Repayment Capacity:</span><span class="value">${application.repayment_capacity}</span></div>` : ''}
              <div class="field"><span class="label">Currently Running Loan:</span><span class="value">${application.has_current_loan ? 'Yes' : 'No'}</span></div>
            </div>

            <div class="footer">
              <p>This application was submitted on ${new Date().toLocaleString()}</p>
              <p>Status: Pending Review</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Resend
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Loan Applications <noreply@prodigygroup.com.ng>',
          to: ['info@prodigygroup.com.ng'],
          subject: `New Loan Application: ${application.business_name} - ₦${parseFloat(application.loan_amount).toLocaleString()}`,
          html: emailHtml
        })
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.error('Resend API error:', errorText)
        throw new Error(`Email sending failed: ${errorText}`)
      }

      const emailResult = await emailResponse.json()
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          emailId: emailResult.id
        }),
        {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        }
      )
    } else {
      // If no API key, just log (for development)
      console.log('Email would be sent:', {
        to: 'info@prodigygroup.com.ng',
        applicationId,
        businessName: application.business_name,
        loanAmount: application.loan_amount
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No email API key configured (development mode)'
        }),
        {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        }
      )
    }
  } catch (error: any) {
    console.error('Error in send-loan-application-email:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      }
    )
  }
})
