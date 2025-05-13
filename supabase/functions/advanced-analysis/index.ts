
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { ideaId } = await req.json();

    // Validate input
    if (!ideaId) {
      return new Response(
        JSON.stringify({ error: "Missing ideaId parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the idea details
    const { data: ideaData, error: ideaError } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", ideaId)
      .single();

    if (ideaError || !ideaData) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch idea data", details: ideaError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Fetch existing analysis for enrichment
    const { data: analysisData, error: analysisError } = await supabase
      .from("idea_analyses")
      .select("*")
      .eq("idea_id", ideaId)
      .single();

    // Generate mock advanced analysis data (replace with actual OpenAI call in production)
    // In a real implementation, this would call OpenAI's GPT-4o API with appropriate data
    const advancedAnalysis = {
      businessName: {
        name: "TechFlow",
        slogan: "Simplifying Technology for Everyone",
        justification: "The name 'TechFlow' conveys both technical expertise and a smooth user experience. It suggests that technology can flow seamlessly into people's lives."
      },
      logoUrl: "https://placehold.co/400x400/3b82f6/FFFFFF/png?text=TF",
      summary: {
        description: "TechFlow aims to create intuitive software solutions for everyday technology challenges. By focusing on user experience and accessibility, TechFlow has the potential to capture a significant market share in the consumer tech support and education sector."
      },
      differentials: [
        "AI-powered troubleshooting", 
        "Personalized learning paths", 
        "Community knowledge base", 
        "Live remote assistance"
      ],
      pitch: "TechFlow transforms how people interact with technology by providing intuitive, AI-powered solutions that solve everyday tech problems. Our platform combines automated troubleshooting, personalized learning, and on-demand expert support to help users of all skill levels overcome technology challenges and build confidence with their devices.",
      marketAnalysis: {
        size: "The global tech support market is valued at $25 billion annually and growing at 6% CAGR. The consumer segment represents approximately $8.5 billion with higher growth potential.",
        targetAudience: "Primary: Adults aged 35-65 who use technology daily but lack technical expertise. Secondary: Small businesses without dedicated IT staff.",
        trends: [
          "Increasing dependence on multiple connected devices",
          "Growing complexity of software ecosystems",
          "Rising demand for personalized tech education",
          "Shift toward subscription-based support services"
        ]
      },
      personas: [
        {
          name: "Maria, 52",
          description: "Professional who uses technology for work but struggles with updates and new features. Values efficiency and avoiding tech-related stress."
        },
        {
          name: "João, 38",
          description: "Small business owner who needs reliable tech but can't afford dedicated IT support. Looking for cost-effective solutions and quick problem resolution."
        }
      ],
      monetization: {
        models: [
          {
            name: "Freemium Subscription",
            description: "Basic troubleshooting free; advanced features and human support require subscription",
            revenue: "Est. $15-25 per user monthly"
          },
          {
            name: "Enterprise Licenses",
            description: "Custom packages for small businesses with multiple users",
            revenue: "Est. $100-500 per business monthly"
          }
        ]
      },
      channels: [
        {
          name: "Content Marketing",
          description: "Tech guides, tutorials and troubleshooting articles to drive organic traffic"
        },
        {
          name: "Partnerships",
          description: "Collaborations with device manufacturers and software companies"
        },
        {
          name: "App Store Optimization",
          description: "Mobile app distribution with targeted keywords and ratings focus"
        }
      ],
      competitors: [
        {
          name: "GeekSquad",
          strengths: ["Established brand", "Physical presence", "Broad service range"],
          weaknesses: ["Expensive", "Inconsistent quality", "Limited online tools"]
        },
        {
          name: "HelloTech",
          strengths: ["On-demand service", "Simple pricing", "Good mobile experience"],
          weaknesses: ["Limited self-help options", "Geographic limitations", "No AI capabilities"]
        }
      ],
      swot: {
        strengths: ["AI-powered automation", "Scalable platform", "Lower cost than competitors", "User-friendly interface"],
        weaknesses: ["New brand, limited recognition", "Requires initial content investment", "Dependent on quality AI training"],
        opportunities: ["Underserved middle market", "Growing senior tech adoption", "Remote work increasing tech reliance", "Integration with smart home ecosystems"],
        threats: ["Big tech companies entering market", "Low barriers to entry", "Privacy concerns with remote access", "Free content alternatives"]
      },
      risks: [
        {
          name: "AI accuracy limitations",
          level: "Médio",
          description: "AI may fail to correctly diagnose complex technical problems",
          mitigation: "Implement human review system and continuous learning from corrections"
        },
        {
          name: "User privacy concerns",
          level: "Alto",
          description: "Remote troubleshooting requires access to user devices and data",
          mitigation: "Develop robust security protocols and transparent privacy policies"
        }
      ],
      tools: [
        { name: "Docusaurus", category: "Documentation" },
        { name: "Intercom", category: "Customer Support" },
        { name: "Zapier", category: "Automation" },
        { name: "Mixpanel", category: "Analytics" }
      ],
      firstSteps: [
        { name: "Market Validation", icon: "📊" },
        { name: "MVP Development", icon: "💻" },
        { name: "Initial Content", icon: "📝" },
        { name: "Beta Testing", icon: "🧪" }
      ],
      plan: {
        thirtyDays: [
          { name: "Competitor Analysis", description: "Detailed review of top 5 competitors' offerings and gaps" },
          { name: "User Interviews", description: "Conduct 20+ interviews with target demographic" },
          { name: "MVP Feature Spec", description: "Define minimum viable product features and architecture" }
        ],
        sixtyDays: [
          { name: "Basic AI Model", description: "Develop and train initial troubleshooting AI" },
          { name: "Knowledge Base", description: "Create first 100 support articles for common issues" },
          { name: "UI Prototyping", description: "Design and user-test key application flows" }
        ],
        ninetyDays: [
          { name: "Beta Launch", description: "Release to limited audience of 250 users" },
          { name: "Feedback Loop", description: "Implement analytics and user feedback mechanisms" },
          { name: "Growth Strategy", description: "Develop marketing plan for public release" }
        ]
      },
      mindmap: {
        id: "root",
        label: "TechFlow",
        children: [
          {
            id: "market",
            label: "Market",
            children: [
              { id: "audience", label: "Target Audience" },
              { id: "trends", label: "Industry Trends" }
            ]
          },
          {
            id: "product",
            label: "Product",
            children: [
              { id: "features", label: "Key Features" },
              { id: "roadmap", label: "Development Roadmap" }
            ]
          }
        ]
      }
    };

    // Save the advanced analysis to the database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("advanced_analyses")
      .upsert({ 
        idea_id: ideaId,
        user_id: ideaData.user_id,
        analysis_data: advancedAnalysis 
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving advanced analysis:", saveError);
      return new Response(
        JSON.stringify({ error: "Failed to save analysis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Advanced analysis created successfully", analysis: savedAnalysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in advanced-analysis function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
