export async function onRequestGet(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const projectId = searchParams.get("project_id");
    
    let query = "SELECT a.*, p.title as project_title FROM applicants a JOIN projects p ON a.project_id = p.id";
    let params = [];
    
    if (projectId) {
      query += " WHERE a.project_id = ?";
      params.push(projectId);
    }
    
    query += " ORDER BY a.created_at DESC";
    
    const { results } = await context.env.DB.prepare(query).bind(...params).all();
    
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
    const { project_id, name, email, phone, resume_url, portfolio_url, cover_letter } = body;
    
    // project_id and name are optional; provide defaults if missing
    const applicantProjectId = project_id || null; // null indicates no project association
    const applicantName = name || "Unnamed Applicant";

    // Verify project exists
    const project = await context.env.DB.prepare("SELECT id FROM projects WHERE id = ?").bind(project_id).first();
    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stage = "new"; // Default stage is New

    await context.env.DB.prepare(
      `INSERT INTO applicants 
       (id, project_id, name, email, phone, resume_url, portfolio_url, cover_letter, stage) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      applicantProjectId,
      applicantName,
      email || "",
      phone || "",
      resume_url || "",
      portfolio_url || "",
      cover_letter || "",
      stage
    ).run();

    const newApplicant = {
      id,
      project_id: applicantProjectId,
      name: applicantName,
      email,
      phone,
      resume_url,
      portfolio_url,
      cover_letter,
      stage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return new Response(JSON.stringify(newApplicant), {
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

export async function onRequestPut(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const { applicant_id, title, scheduled_at, duration_minutes, notes } = body;
    
    if (!applicant_id || !scheduled_at) {
      return new Response(JSON.stringify({ error: "Applicant ID and Scheduled Date are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const interviewTitle = title || "Interview";

    // Verify applicant exists
    const applicant = await context.env.DB.prepare("SELECT * FROM applicants WHERE id = ?").bind(id).first();
    if (!applicant) {
      return new Response(JSON.stringify({ error: "Applicant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const updatedStage = stage !== undefined ? stage : applicant.stage;
    const updatedName = name !== undefined ? name : applicant.name;
    const updatedEmail = email !== undefined ? email : applicant.email;
    const updatedPhone = phone !== undefined ? phone : applicant.phone;
    const updatedResume = resume_url !== undefined ? resume_url : applicant.resume_url;
    const updatedPortfolio = portfolio_url !== undefined ? portfolio_url : applicant.portfolio_url;
    const updatedCover = cover_letter !== undefined ? cover_letter : applicant.cover_letter;
    const now = new Date().toISOString();

    await context.env.DB.prepare(
      `UPDATE applicants SET 
       stage = ?, name = ?, email = ?, phone = ?, resume_url = ?, portfolio_url = ?, cover_letter = ?, updated_at = ? 
       WHERE id = ?`
    ).bind(
      updatedStage,
      updatedName,
      updatedEmail,
      updatedPhone,
      updatedResume,
      updatedPortfolio,
      updatedCover,
      now,
      id
    ).run();

    const updatedApplicant = {
      ...applicant,
      stage: updatedStage,
      name: updatedName,
      email: updatedEmail,
      phone: updatedPhone,
      resume_url: updatedResume,
      portfolio_url: updatedPortfolio,
      cover_letter: updatedCover,
      updated_at: now
    };

    return new Response(JSON.stringify(updatedApplicant), {
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

// DELETE applicant handler
export async function onRequestDelete(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const id = searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "Applicant ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    // Verify applicant exists
    const applicant = await context.env.DB.prepare("SELECT id FROM applicants WHERE id = ?").bind(id).first();
    if (!applicant) {
      return new Response(JSON.stringify({ error: "Applicant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await context.env.DB.prepare("DELETE FROM applicants WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: "Applicant deleted successfully" }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
