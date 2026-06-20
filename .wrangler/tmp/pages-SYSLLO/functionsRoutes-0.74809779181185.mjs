import { onRequestGet as __api_applicants_js_onRequestGet } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\applicants.js"
import { onRequestOptions as __api_applicants_js_onRequestOptions } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\applicants.js"
import { onRequestPost as __api_applicants_js_onRequestPost } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\applicants.js"
import { onRequestPut as __api_applicants_js_onRequestPut } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\applicants.js"
import { onRequestDelete as __api_interviews_js_onRequestDelete } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\interviews.js"
import { onRequestGet as __api_interviews_js_onRequestGet } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\interviews.js"
import { onRequestOptions as __api_interviews_js_onRequestOptions } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\interviews.js"
import { onRequestPost as __api_interviews_js_onRequestPost } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\interviews.js"
import { onRequestGet as __api_projects_js_onRequestGet } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\projects.js"
import { onRequestOptions as __api_projects_js_onRequestOptions } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\projects.js"
import { onRequestPost as __api_projects_js_onRequestPost } from "C:\\Users\\asus\\OneDrive\\Desktop\\Antigravity\\SmartRecruit\\functions\\api\\projects.js"

export const routes = [
    {
      routePath: "/api/applicants",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_applicants_js_onRequestGet],
    },
  {
      routePath: "/api/applicants",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_applicants_js_onRequestOptions],
    },
  {
      routePath: "/api/applicants",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_applicants_js_onRequestPost],
    },
  {
      routePath: "/api/applicants",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_applicants_js_onRequestPut],
    },
  {
      routePath: "/api/interviews",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_interviews_js_onRequestDelete],
    },
  {
      routePath: "/api/interviews",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_interviews_js_onRequestGet],
    },
  {
      routePath: "/api/interviews",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_interviews_js_onRequestOptions],
    },
  {
      routePath: "/api/interviews",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_interviews_js_onRequestPost],
    },
  {
      routePath: "/api/projects",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_projects_js_onRequestGet],
    },
  {
      routePath: "/api/projects",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_projects_js_onRequestOptions],
    },
  {
      routePath: "/api/projects",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_projects_js_onRequestPost],
    },
  ]