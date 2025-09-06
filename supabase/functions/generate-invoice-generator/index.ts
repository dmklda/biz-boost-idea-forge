import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, clientInfo, services, currency } = await req.json();
    
    if (!idea) {
      throw new Error('Idea is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an invoice generation expert. Create professional invoices with proper formatting and calculations. Return your response in valid JSON format.`
          },
          {
            role: 'user',
            content: `Generate invoice templates for: "${idea.title}" - ${idea.description}
            
Client Info: ${clientInfo || 'Standard client template'}
Services: ${services || 'Consulting services'}
Currency: ${currency || 'USD'}

Return as JSON: {
  "invoice": {
    "header": {
      "companyName": "string",
      "companyAddress": "string",
      "invoiceNumber": "string",
      "date": "string",
      "dueDate": "string"
    },
    "client": {
      "name": "string",
      "address": "string",
      "contact": "string"
    },
    "items": [
      {
        "description": "string",
        "quantity": 0,
        "rate": 0,
        "amount": 0
      }
    ],
    "totals": {
      "subtotal": 0,
      "tax": 0,
      "total": 0
    },
    "terms": "string",
    "notes": "string"
  },
  "templates": [],
  "automationTips": []
}`
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const content = data.choices[0].message.content;
    let cleanContent = content.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
    
    try {
      const parsedContent = JSON.parse(cleanContent);
      return new Response(JSON.stringify({ invoice: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      return new Response(JSON.stringify({ invoice: cleanContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-invoice-generator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});