export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM projects ORDER BY created_at DESC"
    ).all();
    
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
    const { title, description, status } = body;
    
    // Title and description are optional; provide defaults if missing
    const projectTitle = title || "Untitled Project";
    const projectDesc = description || "";

    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const projectStatus = status || 'open';

    await context.env.DB.prepare(
      "INSERT INTO projects (id, title, description, status) VALUES (?, ?, ?, ?)"
    ).bind(id, projectTitle, projectDesc, projectStatus).run();

    const project = { id, title, description, status: projectStatus, created_at: new Date().toISOString() };

    return new Response(JSON.stringify(project), {
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
      return new Response(JSON.stringify({ error: "Project ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verify project exists
    const project = await context.env.DB.prepare("SELECT id FROM projects WHERE id = ?").bind(id).first();
    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // SQLite FOREIGN KEY ON DELETE CASCADE will handle deleting applicants and interviews automatically!
    await context.env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();

    return new Response(JSON.stringify({ success: true, message: "Project deleted successfully" }), {
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
