export async function onRequestGet(context) {
  try {
    const query = `
      SELECT 
        i.*, 
        a.name as applicant_name, 
        a.email as applicant_email, 
        a.phone as applicant_phone, 
        a.stage as applicant_stage, 
        p.title as project_title,
        p.id as project_id
      FROM interviews i 
      JOIN applicants a ON i.applicant_id = a.id 
      JOIN projects p ON a.project_id = p.id
      ORDER BY i.scheduled_at ASC
    `;
    
    const { results } = await context.env.DB.prepare(query).all();
    
    return new Response(JSON.stringify(results), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const { applicant_id, title, scheduled_at, duration_minutes, notes } = body;
    
    // Validate required applicant_id; title and scheduled_at are optional
    if (!applicant_id) {
      return new Response(JSON.stringify({ error: "Applicant ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const interviewTitle = title || "Interview";
    const interviewScheduled = scheduled_at || null; // null indicates unclear schedule
    
    // Verify applicant exists
    const applicant = await context.env.DB.prepare("SELECT * FROM applicants WHERE id = ?").bind(applicant_id).first();
    if (!applicant) {
      return new Response(JSON.stringify({ error: "Applicant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const id = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duration = duration_minutes || 60;
    
    await context.env.DB.prepare(
      `INSERT INTO interviews (id, applicant_id, title, scheduled_at, duration_minutes, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, applicant_id, interviewTitle, interviewScheduled, duration, notes || "").run();
    
    // Auto-update applicant stage to 'interview' if it isn't already 'interview' / 'offer' / 'hired'
    const currentStage = await context.env.DB.prepare("SELECT stage FROM applicants WHERE id = ?").bind(applicant_id).first();
    if (currentStage && (currentStage.stage === 'new' || currentStage.stage === 'screening')) {
      await context.env.DB.prepare("UPDATE applicants SET stage = ?, updated_at = ? WHERE id = ?")
        .bind('interview', new Date().toISOString(), applicant_id)
        .run();
    }
    
    const newInterview = {
      id,
      applicant_id,
      title: interviewTitle,
      scheduled_at: interviewScheduled,
      duration_minutes: duration,
      notes,
      created_at: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(newInterview), {
      status: 201,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestDelete(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Interview ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verify interview exists
    const interview = await context.env.DB.prepare("SELECT id FROM interviews WHERE id = ?").bind(id).first();
    if (!interview) {
      return new Response(JSON.stringify({ error: "Interview not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    await context.env.DB.prepare("DELETE FROM interviews WHERE id = ?").bind(id).run();

    return new Response(JSON.stringify({ success: true, message: "Interview deleted successfully" }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Preflight CORS handler
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
