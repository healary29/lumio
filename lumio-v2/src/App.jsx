import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Playfair+Display:wght@700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #fafaf8; --surface: #ffffff; --border: #ebebeb; --border2: #f0f0f0;
  --text: #0e0e0e; --muted: #8a8a8a; --accent: #1a1a1a;
  --accent2: #3d5afe; --accent2-light: #eef0ff; --accent3: #ff4b6e;
  --green: #00c48c; --radius: 16px; --radius-sm: 10px;
  --shadow: 0 2px 20px rgba(0,0,0,0.06); --shadow2: 0 8px 40px rgba(0,0,0,0.12);
}
body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }
button { font-family:inherit; cursor:pointer; border:none; outline:none; }
input,textarea { font-family:inherit; outline:none; border:none; }
::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:#ddd; border-radius:4px; }
.auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#f5f7ff 0%,#fef9f0 100%); padding:20px; }
.auth-card { background:var(--surface); border-radius:24px; padding:48px 40px; width:100%; max-width:420px; box-shadow:var(--shadow2); }
.auth-logo { font-family:'Playfair Display',serif; font-size:36px; text-align:center; margin-bottom:8px; background:linear-gradient(135deg,#1a1a1a,#3d5afe); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.auth-sub { text-align:center; color:var(--muted); font-size:14px; margin-bottom:32px; }
.auth-tabs { display:flex; background:var(--bg); border-radius:12px; padding:4px; margin-bottom:28px; }
.auth-tab { flex:1; padding:10px; text-align:center; border-radius:9px; font-size:14px; font-weight:500; color:var(--muted); transition:all .2s; cursor:pointer; background:none; border:none; }
.auth-tab.active { background:var(--surface); color:var(--text); box-shadow:0 2px 8px rgba(0,0,0,0.08); }
.field { margin-bottom:16px; }
.field label { display:block; font-size:12px; font-weight:600; color:var(--muted); margin-bottom:6px; letter-spacing:.5px; text-transform:uppercase; }
.field input { width:100%; background:var(--bg); border:1.5px solid var(--border); border-radius:12px; padding:13px 16px; font-size:15px; transition:border .2s; }
.field input:focus { border-color:var(--accent2); }
.btn-primary { width:100%; background:var(--accent); color:#fff; border-radius:12px; padding:14px; font-size:15px; font-weight:600; transition:transform .15s,opacity .15s; margin-top:4px; }
.btn-primary:hover { opacity:.85; transform:translateY(-1px); } .btn-primary:disabled { opacity:.5; cursor:not-allowed; transform:none; }
.auth-err { color:var(--accent3); font-size:13px; text-align:center; margin-top:12px; }
.auth-ok { color:var(--green); font-size:13px; text-align:center; margin-top:12px; }
.app { display:flex; flex-direction:column; min-height:100vh; }

/* ── TOP HEADER ── */
.topbar { position:fixed; top:0; left:0; right:0; height:56px; background:var(--surface); border-bottom:1.5px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 20px; z-index:200; box-shadow:0 1px 12px rgba(0,0,0,0.04); }
.topbar-logo { font-family:'Playfair Display',serif; font-size:26px; background:linear-gradient(135deg,#1a1a1a,#3d5afe); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.topbar-right { display:flex; align-items:center; gap:10px; }
.topbar-settings { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:var(--bg); color:var(--muted); transition:all .18s; }
.topbar-settings:hover { background:var(--accent2-light); color:var(--accent2); transform:rotate(45deg); }

/* ── BOTTOM TAB BAR ── */
.bottom-nav {
  position:fixed; bottom:0; left:0; right:0;
  height:64px;
  background:var(--surface);
  border-top:1.5px solid var(--border);
  display:flex; align-items:stretch;
  z-index:200;
  padding-bottom:env(safe-area-inset-bottom);
  box-shadow:0 -4px 24px rgba(0,0,0,0.08);
}
.bottom-tab {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:4px; flex:1;
  color:var(--muted); font-size:10px; font-weight:600;
  cursor:pointer; transition:all .15s;
  background:none; border:none; letter-spacing:.3px;
  position:relative;
}
.bottom-tab:hover { color:var(--text); }
.bottom-tab.active { color:var(--accent2); }
.bottom-tab-dot {
  position:absolute; top:8px; left:50%; transform:translateX(-50%);
  width:4px; height:4px; border-radius:50%;
  background:var(--accent2);
  animation:dotPop .2s cubic-bezier(.34,1.56,.64,1);
}
@keyframes dotPop { from{transform:translateX(-50%) scale(0)} to{transform:translateX(-50%) scale(1)} }

/* ── MAIN CONTENT ── */
.main { flex:1; padding:72px 16px 80px; width:100%; min-height:100vh; }
.page { max-width:620px; margin:0 auto; }
.page-wide { max-width:900px; margin:0 auto; }
.feed-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
.feed-title { font-size:22px; font-weight:700; }
.create-post-card { background:var(--surface); border-radius:var(--radius); border:1.5px solid var(--border); padding:16px; margin-bottom:20px; }
.create-row { display:flex; align-items:flex-start; gap:12px; }
.create-input { flex:1; background:var(--bg); border-radius:14px; padding:12px 18px; font-size:15px; color:var(--text); border:1.5px solid transparent; transition:border .2s; resize:none; line-height:1.6; min-height:48px; }
.create-input:focus { border-color:var(--border); }
.create-actions { display:flex; gap:8px; margin-top:12px; padding-top:12px; border-top:1.5px solid var(--border2); align-items:center; flex-wrap:wrap; }
.create-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:999px; font-size:13px; font-weight:500; background:var(--bg); color:var(--muted); transition:all .18s; }
.create-btn:hover { background:var(--border); color:var(--text); } .create-btn.active-media { background:var(--accent2-light); color:var(--accent2); }
.post-submit { background:var(--accent2); color:#fff; border-radius:999px; padding:9px 20px; font-size:14px; font-weight:600; margin-left:auto; transition:opacity .18s; }
.post-submit:hover { opacity:.85; } .post-submit:disabled { opacity:.5; cursor:not-allowed; }
.post-card { background:var(--surface); border-radius:var(--radius); border:1.5px solid var(--border); margin-bottom:16px; overflow:hidden; transition:box-shadow .18s; }
.post-card:hover { box-shadow:var(--shadow); }
.post-head { display:flex; align-items:center; gap:10px; padding:16px 16px 0; }
.post-meta { flex:1; } .post-name { font-size:14px; font-weight:600; cursor:pointer; } .post-name:hover { text-decoration:underline; }
.post-time { font-size:12px; color:var(--muted); } .post-body { padding:12px 16px; font-size:15px; line-height:1.6; }
.post-image { width:100%; max-height:400px; object-fit:cover; } .post-video { width:100%; max-height:480px; background:#000; display:block; }
.post-actions { display:flex; align-items:center; gap:4px; padding:8px 12px 12px; }
.action-btn { display:flex; align-items:center; gap:6px; padding:8px 12px; border-radius:999px; background:none; color:var(--muted); font-size:13px; font-weight:500; transition:all .18s; }
.action-btn:hover { background:var(--bg); color:var(--text); } .action-btn.liked { color:var(--accent3); }
.video-badge { display:inline-flex; align-items:center; gap:5px; background:#1a1a1a; color:#fff; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; margin:8px 16px 0; }
.comments-section { border-top:1.5px solid var(--border2); padding:12px 16px; }
.comment { display:flex; gap:10px; margin-bottom:10px; }
.comment-bubble { background:var(--bg); border-radius:12px; padding:8px 12px; flex:1; }
.comment-author { font-size:12px; font-weight:600; margin-bottom:2px; } .comment-text { font-size:13px; line-height:1.5; }
.comment-input-row { display:flex; gap:8px; align-items:center; margin-top:8px; }
.comment-input { flex:1; background:var(--bg); border-radius:999px; padding:9px 14px; font-size:13px; border:1.5px solid transparent; transition:border .2s; }
.comment-input:focus { border-color:var(--border); }
.comment-send { background:var(--accent2); color:#fff; border-radius:999px; padding:9px 16px; font-size:13px; font-weight:600; }
.search-bar-wrap { position:relative; margin-bottom:28px; }
.search-bar { width:100%; background:var(--surface); border:1.5px solid var(--border); border-radius:999px; padding:14px 20px 14px 48px; font-size:15px; transition:border .2s,box-shadow .2s; }
.search-bar:focus { border-color:var(--accent2); box-shadow:0 0 0 3px var(--accent2-light); }
.search-icon { position:absolute; left:17px; top:50%; transform:translateY(-50%); color:var(--muted); }
.user-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:16px; }
.user-card { background:var(--surface); border:1.5px solid var(--border); border-radius:var(--radius); padding:20px 16px; text-align:center; cursor:pointer; transition:box-shadow .18s,transform .18s; }
.user-card:hover { box-shadow:var(--shadow); transform:translateY(-2px); }
.user-card-name { font-size:15px; font-weight:600; margin-bottom:2px; } .user-card-handle { font-size:12px; color:var(--muted); margin-bottom:12px; }
.follow-btn { background:var(--accent); color:#fff; border-radius:999px; padding:7px 18px; font-size:13px; font-weight:600; transition:opacity .18s; }
.follow-btn:hover { opacity:.8; } .follow-btn.following { background:var(--bg); color:var(--text); border:1.5px solid var(--border); }
.profile-cover { height:180px; background:linear-gradient(135deg,#3d5afe22,#ff4b6e22); border-radius:var(--radius) var(--radius) 0 0; }
.profile-card { background:var(--surface); border:1.5px solid var(--border); border-radius:var(--radius); overflow:hidden; margin-bottom:24px; }
.profile-info { padding:0 24px 24px; }
.profile-avatar-wrap { display:flex; align-items:flex-end; justify-content:space-between; margin-top:-40px; margin-bottom:16px; }
.profile-name { font-size:20px; font-weight:700; margin-bottom:2px; } .profile-handle { font-size:14px; color:var(--muted); margin-bottom:10px; }
.profile-bio { font-size:14px; line-height:1.6; margin-bottom:16px; }
.profile-stats { display:flex; gap:28px; } .stat-num { font-size:18px; font-weight:700; } .stat-label { font-size:12px; color:var(--muted); }
.profile-actions { display:flex; gap:8px; }
.btn-outline { background:none; border:1.5px solid var(--border); border-radius:999px; padding:9px 20px; font-size:14px; font-weight:600; color:var(--text); transition:all .18s; }
.btn-outline:hover { background:var(--bg); }
.btn-blue { background:var(--accent2); color:#fff; border-radius:999px; padding:9px 20px; font-size:14px; font-weight:600; transition:opacity .18s; }
.btn-blue:hover { opacity:.85; }
.profile-tabs { display:flex; border-bottom:1.5px solid var(--border2); margin-bottom:20px; }
.profile-tab { padding:12px 20px; font-size:14px; font-weight:500; color:var(--muted); cursor:pointer; border-bottom:2px solid transparent; transition:all .18s; }
.profile-tab.active { color:var(--accent2); border-bottom-color:var(--accent2); }
.reels-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
.reel-card { background:#111; border-radius:var(--radius); overflow:hidden; position:relative; aspect-ratio:9/16; cursor:pointer; transition:transform .2s; }
.reel-card:hover { transform:scale(1.02); }
.reel-overlay { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent,rgba(0,0,0,.75)); padding:16px 12px 12px; color:#fff; }
.reel-caption { font-size:13px; font-weight:500; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.reel-meta { display:flex; align-items:center; gap:10px; font-size:12px; opacity:.85; }
.reel-feed::-webkit-scrollbar { display:none; }
.reel-upload-box { background:var(--surface); border:2px dashed var(--border); border-radius:var(--radius); padding:40px 20px; text-align:center; margin-bottom:24px; cursor:pointer; transition:border-color .2s; }
.reel-upload-box:hover { border-color:var(--accent2); }
.video-preview { position:relative; margin-top:10px; border-radius:12px; overflow:hidden; background:#000; }
.image-preview { position:relative; margin-top:10px; }
.image-preview img { width:100%; max-height:300px; object-fit:cover; border-radius:12px; }
.remove-media { position:absolute; top:8px; right:8px; background:rgba(0,0,0,.6); color:#fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:16px; cursor:pointer; border:none; }
.upload-progress { background:var(--bg); border-radius:999px; height:6px; margin-top:10px; overflow:hidden; }
.upload-progress-bar { height:100%; background:var(--accent2); border-radius:999px; transition:width .3s; }
.messages-layout { display:grid; grid-template-columns:280px 1fr; background:var(--surface); border:1.5px solid var(--border); border-radius:var(--radius); overflow:hidden; height:calc(100vh - 140px); }
.convo-list { border-right:1.5px solid var(--border2); overflow-y:auto; }
.convo-item { display:flex; align-items:center; gap:12px; padding:14px 16px; cursor:pointer; transition:background .15s; }
.convo-item:hover { background:var(--bg); } .convo-item.active { background:var(--accent2-light); }
.convo-name { font-size:14px; font-weight:600; margin-bottom:2px; }
.convo-preview { font-size:12px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.chat-area { display:flex; flex-direction:column; }
.chat-header { padding:16px 20px; border-bottom:1.5px solid var(--border2); display:flex; align-items:center; gap:12px; }
.chat-messages { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:12px; }
.msg-row { display:flex; gap:8px; } .msg-row.mine { flex-direction:row-reverse; }
.msg-bubble { max-width:70%; padding:10px 14px; border-radius:18px; font-size:14px; line-height:1.5; }
.msg-row.mine .msg-bubble { background:var(--accent2); color:#fff; border-bottom-right-radius:4px; }
.msg-row.other .msg-bubble { background:var(--bg); border-bottom-left-radius:4px; }
.chat-input-bar { padding:16px; border-top:1.5px solid var(--border2); display:flex; gap:10px; align-items:center; }
.chat-input { flex:1; background:var(--bg); border-radius:999px; padding:12px 18px; font-size:14px; border:1.5px solid transparent; transition:border .2s; }
.chat-input:focus { border-color:var(--border); }
.chat-send { background:var(--accent2); color:#fff; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.no-chat { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--muted); gap:12px; }
.settings-section { background:var(--surface); border:1.5px solid var(--border); border-radius:var(--radius); padding:24px; margin-bottom:20px; }
.settings-title { font-size:16px; font-weight:700; margin-bottom:20px; }
.settings-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1.5px solid var(--border2); }
.settings-row:last-child { border-bottom:none; }
.settings-label { font-size:14px; font-weight:500; } .settings-sub { font-size:12px; color:var(--muted); margin-top:2px; }
.settings-input { background:var(--bg); border:1.5px solid var(--border); border-radius:10px; padding:10px 14px; font-size:14px; width:220px; transition:border .2s; }
.settings-input:focus { border-color:var(--accent2); }
.btn-save { background:var(--accent2); color:#fff; border-radius:999px; padding:9px 22px; font-size:14px; font-weight:600; }
.btn-save:disabled { opacity:.5; cursor:not-allowed; }
.btn-danger { background:#fff0f2; color:var(--accent3); border:1.5px solid #ffd0d8; border-radius:999px; padding:9px 22px; font-size:14px; font-weight:600; transition:all .18s; }
.btn-danger:hover { background:var(--accent3); color:#fff; }
.modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(4px); }
.modal { background:var(--surface); border-radius:20px; padding:32px; width:100%; max-width:460px; box-shadow:var(--shadow2); }
.modal-title { font-size:18px; font-weight:700; margin-bottom:20px; }
.modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
.notif { position:fixed; top:20px; right:20px; background:var(--accent); color:#fff; border-radius:12px; padding:14px 20px; font-size:14px; font-weight:500; z-index:9999; box-shadow:var(--shadow2); animation:slideIn .3s ease; }
.notif.err { background:var(--accent3); }
@keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
.spinner { display:inline-block; width:20px; height:20px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
.spinner.dark { border-color:rgba(0,0,0,.1); border-top-color:var(--accent2); }
@keyframes spin { to{transform:rotate(360deg)} }
.loading-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; }
.loading-logo { font-family:'Playfair Display',serif; font-size:42px; background:linear-gradient(135deg,#1a1a1a,#3d5afe); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.empty { text-align:center; padding:60px 20px; color:var(--muted); } .empty-icon { font-size:40px; margin-bottom:12px; } .empty-text { font-size:15px; }
.avatar { border-radius:50%; object-fit:cover; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; overflow:hidden; cursor:pointer; }

/* ── PROFILE PIC VIEWER ── */
.pic-viewer-bg { position:fixed; inset:0; background:rgba(0,0,0,.92); z-index:9999; display:flex; align-items:center; justify-content:center; animation:fadeIn .2s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.pic-viewer-img { width:min(90vw,400px); height:min(90vw,400px); border-radius:50%; object-fit:cover; box-shadow:0 0 60px rgba(0,0,0,.8); border:3px solid rgba(255,255,255,.15); }
.pic-viewer-initials { width:min(90vw,400px); height:min(90vw,400px); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:clamp(60px,15vw,120px); font-weight:700; color:#fff; }
.pic-viewer-name { color:#fff; font-size:18px; font-weight:700; margin-top:20px; text-align:center; }
.pic-viewer-handle { color:rgba(255,255,255,.6); font-size:14px; margin-top:4px; text-align:center; }
.pic-viewer-close { position:fixed; top:20px; right:20px; background:rgba(255,255,255,.15); border:none; color:#fff; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; backdrop-filter:blur(8px); font-size:20px; }

/* ── MESSAGES IG STYLE ── */
.ig-messages { display:flex; height:calc(100vh - 136px); background:var(--surface); border-radius:var(--radius); border:1.5px solid var(--border); overflow:hidden; }
.ig-convo-list { width:340px; border-right:1.5px solid var(--border2); display:flex; flex-direction:column; flex-shrink:0; }
.ig-convo-header { padding:20px 20px 12px; font-family:'Playfair Display',serif; font-size:22px; font-weight:700; border-bottom:1.5px solid var(--border2); }
.ig-convo-search { padding:10px 16px; border-bottom:1.5px solid var(--border2); }
.ig-convo-search input { width:100%; background:var(--bg); border-radius:999px; padding:9px 16px; font-size:14px; color:var(--text); border:none; }
.ig-convo-items { flex:1; overflow-y:auto; }
.ig-convo-item { display:flex; align-items:center; gap:12px; padding:12px 16px; cursor:pointer; transition:background .15s; position:relative; }
.ig-convo-item:hover { background:var(--bg); }
.ig-convo-item.active { background:var(--accent2-light); }
.ig-convo-dot { width:8px; height:8px; background:var(--accent2); border-radius:50%; position:absolute; right:16px; top:50%; transform:translateY(-50%); }
.ig-chat { flex:1; display:flex; flex-direction:column; min-width:0; }
.ig-chat-header { padding:14px 20px; border-bottom:1.5px solid var(--border2); display:flex; align-items:center; gap:12px; }
.ig-chat-header-info { flex:1; }
.ig-chat-header-name { font-size:15px; font-weight:700; }
.ig-chat-header-handle { font-size:12px; color:var(--muted); }
.ig-chat-messages { flex:1; overflow-y:auto; padding:16px 20px; display:flex; flex-direction:column; gap:4px; }
.ig-msg-group { display:flex; flex-direction:column; margin-bottom:8px; }
.ig-msg-group.mine { align-items:flex-end; }
.ig-msg-group.other { align-items:flex-start; flex-direction:row; gap:8px; }
.ig-msg-group.other .ig-msg-bubbles { align-items:flex-start; }
.ig-msg-bubbles { display:flex; flex-direction:column; gap:2px; max-width:68%; }
.ig-bubble { padding:10px 14px; border-radius:20px; font-size:14px; line-height:1.5; word-break:break-word; }
.mine .ig-bubble { background:var(--accent2); color:#fff; border-bottom-right-radius:4px; }
.other .ig-bubble { background:var(--bg); color:var(--text); border-bottom-left-radius:4px; }
.ig-bubble:not(:last-child) { border-radius:20px; }
.ig-msg-time { font-size:10px; color:var(--muted); margin-top:2px; padding:0 4px; }
.ig-chat-input { padding:12px 16px; border-top:1.5px solid var(--border2); display:flex; align-items:center; gap:10px; }
.ig-chat-input input { flex:1; background:var(--bg); border-radius:999px; padding:11px 18px; font-size:14px; border:1.5px solid var(--border); transition:border .2s; }
.ig-chat-input input:focus { border-color:var(--accent2); outline:none; }
.ig-send-btn { background:var(--accent2); color:#fff; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:none; cursor:pointer; transition:opacity .18s; }
.ig-send-btn:hover { opacity:.85; }
.ig-no-chat { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--muted); gap:12px; }
`;

const icons = {
  Home: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Video: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Msg: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  User: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Settings: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34L3 9l3 3-3 3 3.99 5.66A10 10 0 0 0 19.07 19.07L21 15l-3-3 3-3-1.93-3.07Z"/></svg>,
  Heart: ({ filled }) => <svg width="18" height="18" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Comment: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Share: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Send: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Img: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Vid: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Logout: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Upload: () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  Play: () => <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  X: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ── PROFILE PIC VIEWER ───────────────────────────────────────
function ProfilePicViewer({ profile, onClose }) {
  const gs = ["linear-gradient(135deg,#3d5afe,#ff4b6e)","linear-gradient(135deg,#00c48c,#3d5afe)","linear-gradient(135deg,#ff9a00,#ff4b6e)","linear-gradient(135deg,#a855f7,#3d5afe)"];
  const g = gs[(profile?.username?.charCodeAt(0)||0) % gs.length];
  useEffect(() => {
    const close = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="pic-viewer-bg" onClick={onClose}>
      <button className="pic-viewer-close" onClick={onClose}>✕</button>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }} onClick={e => e.stopPropagation()}>
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt="" className="pic-viewer-img" />
          : <div className="pic-viewer-initials" style={{ background: g }}>
              {profile?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
            </div>
        }
        <div className="pic-viewer-name">{profile?.name}</div>
        <div className="pic-viewer-handle">@{profile?.username}</div>
      </div>
    </div>
  );
}

function Avatar({ profile, size=40, onClick, style={}, viewPic=false }) {
  const [showPic, setShowPic] = useState(false);
  const initials = profile?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?";
  const gs=["linear-gradient(135deg,#3d5afe,#ff4b6e)","linear-gradient(135deg,#00c48c,#3d5afe)","linear-gradient(135deg,#ff9a00,#ff4b6e)","linear-gradient(135deg,#a855f7,#3d5afe)"];
  const g=gs[(profile?.username?.charCodeAt(0)||0)%gs.length];
  const handleClick = e => {
    if (viewPic) { e.stopPropagation(); setShowPic(true); return; }
    onClick && onClick(e);
  };
  return (
    <>
      <div className="avatar" onClick={handleClick} style={{width:size,height:size,background:profile?.avatar_url?"#eee":g,fontSize:size*0.35,...style}}>
        {profile?.avatar_url?<img src={profile.avatar_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:initials}
      </div>
      {showPic && <ProfilePicViewer profile={profile} onClose={() => setShowPic(false)} />}
    </>
  );
}

function timeAgo(ts){const s=Math.floor((Date.now()-new Date(ts))/1000);if(s<60)return"just now";if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`;}

export default function App() {
  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState("feed");
  const [viewProfile,setViewProfile]=useState(null);
  const [notif,setNotif]=useState(null);
  const showNotif=useCallback((msg,err=false)=>{setNotif({msg,err});setTimeout(()=>setNotif(null),3000);},[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);if(session)fetchProfile(session.user.id);else setLoading(false);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{setSession(session);if(session)fetchProfile(session.user.id);else{setProfile(null);setLoading(false);}});
    return()=>subscription.unsubscribe();
  },[]);

  const fetchProfile=async(uid)=>{const{data}=await supabase.from("profiles").select("*").eq("id",uid).single();setProfile(data);setLoading(false);};
  const logout=async()=>{await supabase.auth.signOut();setPage("feed");setViewProfile(null);};
  const goProfile=(p)=>{setViewProfile(p?.id===profile?.id?null:p);setPage("profile");};

  if(loading)return<><style>{STYLE}</style><div className="loading-screen"><div className="loading-logo">Lumio</div><div className="spinner dark"/></div></>;
  if(!session||!profile)return<><style>{STYLE}</style><AuthScreen/></>;

  const tabItems=[
    {id:"feed",label:"Home",Icon:icons.Home},
    {id:"search",label:"Search",Icon:icons.Search},
    {id:"reels",label:"Reels",Icon:icons.Video},
    {id:"messages",label:"Messages",Icon:icons.Msg},
    {id:"profile",label:"Profile",Icon:icons.User},
    {id:"settings",label:"Settings",Icon:icons.Settings},
  ];

  return(
    <><style>{STYLE}</style>
    {notif&&<div className={`notif ${notif.err?"err":""}`}>{notif.msg}</div>}
    <div className="app">

      {/* TOP HEADER */}
      <header className="topbar">
        <div className="topbar-logo">Lumio</div>
        <div className="topbar-right">
          <Avatar profile={profile} size={32} onClick={()=>{setViewProfile(null);setPage("profile");}} style={{border:"2px solid var(--border)"}}/>
          <button className="topbar-settings" onClick={()=>{setViewProfile(null);setPage("settings");}} title="Settings"><icons.Settings/></button>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="main">
        {page==="feed"&&<FeedPage me={profile} goProfile={goProfile} showNotif={showNotif}/>}
        {page==="search"&&<SearchPage me={profile} goProfile={goProfile} showNotif={showNotif}/>}
        {page==="reels"&&<ReelsPage me={profile} showNotif={showNotif} goProfile={goProfile}/>}
        {page==="messages"&&<MessagesPage me={profile} goProfile={goProfile}/>}
        {page==="profile"&&!viewProfile&&<ProfilePage userId={profile.id} me={profile} isOwn goProfile={goProfile} showNotif={showNotif}/>}
        {page==="profile"&&viewProfile&&<ProfilePage userId={viewProfile.id} me={profile} isOwn={false} goProfile={goProfile} showNotif={showNotif}/>}
        {page==="settings"&&<SettingsPage me={profile} setProfile={setProfile} showNotif={showNotif} logout={logout}/>}
      </main>

      {/* BOTTOM TAB BAR */}
      <nav className="bottom-nav">
        {tabItems.map(({id,label,Icon})=>{
          const active=page===id&&!viewProfile;
          return(
            <button key={id} className={`bottom-tab ${active?"active":""}`}
              onClick={()=>{setPage(id);if(id!=="profile")setViewProfile(null);}}>
              {active&&<div className="bottom-tab-dot"/>}
              <span style={{opacity: active ? 1 : 0.6, transform: active ? 'scale(1.12)' : 'scale(1)', transition:'all .15s'}}><Icon/></span>
              <span style={{fontWeight: active ? 700 : 500}}>{label}</span>
            </button>
          );
        })}
      </nav>

    </div></>
  );
}

function AuthScreen(){
  const[tab,setTab]=useState("login");
  const[form,setForm]=useState({name:"",username:"",email:"",password:""});
  const[err,setErr]=useState("");const[ok,setOk]=useState("");const[busy,setBusy]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const login=async()=>{setErr("");setBusy(true);const{error}=await supabase.auth.signInWithPassword({email:form.email,password:form.password});if(error)setErr(error.message);setBusy(false);};
  const signup=async()=>{setErr("");setOk("");if(!form.name||!form.username||!form.email||!form.password)return setErr("Please fill all fields.");if(form.username.includes(" "))return setErr("Username cannot contain spaces.");setBusy(true);const{error}=await supabase.auth.signUp({email:form.email,password:form.password,options:{data:{name:form.name,username:form.username.toLowerCase()}}});if(error)setErr(error.message);else setOk("Account created! Check your email, then log in.");setBusy(false);};
  return(
    <div className="auth-wrap"><div className="auth-card">
      <div className="auth-logo">Lumio</div>
      <div className="auth-sub">Connect. Share. Discover.</div>
      <div className="auth-tabs">
        <button className={`auth-tab ${tab==="login"?"active":""}`} onClick={()=>{setTab("login");setErr("");setOk("");}}>Log In</button>
        <button className={`auth-tab ${tab==="signup"?"active":""}`} onClick={()=>{setTab("signup");setErr("");setOk("");}}>Sign Up</button>
      </div>
      {tab==="signup"&&<><div className="field"><label>Full Name</label><input placeholder="Your name" value={form.name} onChange={set("name")}/></div><div className="field"><label>Username</label><input placeholder="no spaces" value={form.username} onChange={set("username")}/></div></>}
      <div className="field"><label>Email</label><input type="email" placeholder="your@email.com" value={form.email} onChange={set("email")}/></div>
      <div className="field"><label>Password</label><input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e=>e.key==="Enter"&&(tab==="login"?login():signup())}/></div>
      <button className="btn-primary" disabled={busy} onClick={tab==="login"?login:signup}>{busy?<span className="spinner"/>:tab==="login"?"Log In":"Create Account"}</button>
      {err&&<div className="auth-err">{err}</div>}{ok&&<div className="auth-ok">{ok}</div>}
    </div></div>
  );
}

function FeedPage({me,goProfile,showNotif}){
  const[posts,setPosts]=useState([]);
  const[text,setText]=useState("");
  const[mediaFile,setMediaFile]=useState(null);
  const[mediaPreview,setMediaPreview]=useState(null);
  const[mediaType,setMediaType]=useState(null);
  const[posting,setPosting]=useState(false);
  const[pct,setPct]=useState(0);
  const[openC,setOpenC]=useState({});
  const[cTexts,setCTexts]=useState({});
  const imgRef=useRef();const vidRef=useRef();

  useEffect(()=>{load();},[]);

  const load=async()=>{
    const[{data:p},{data:v}]=await Promise.all([
      supabase.from("posts").select("*,profiles(*),likes(user_id),comments(id,content,created_at,profiles(*))").order("created_at",{ascending:false}).limit(30),
      supabase.from("videos").select("*,profiles(*),video_likes(user_id),video_comments(id,content,created_at,profiles(*))").order("created_at",{ascending:false}).limit(20),
    ]);
    const all=[...(p||[]).map(x=>({...x,_t:"post"})),...(v||[]).map(x=>({...x,_t:"video"}))];
    all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    setPosts(all);
  };

  const pickMedia=type=>e=>{
    const f=e.target.files[0];if(!f)return;
    if(type==="video"){const url=URL.createObjectURL(f);const el=document.createElement("video");el.src=url;el.onloadedmetadata=()=>{if(el.duration>60){showNotif("Max 60 seconds!",true);return;}setMediaFile(f);setMediaPreview(url);setMediaType("video");};return;}
    setMediaFile(f);setMediaPreview(URL.createObjectURL(f));setMediaType("image");
  };
  const clearMedia=()=>{setMediaFile(null);setMediaPreview(null);setMediaType(null);};

  const submit=async()=>{
    if(!text.trim()&&!mediaFile)return;
    setPosting(true);setPct(0);
    if(mediaType==="video"){
      const ext=mediaFile.name.split(".").pop();const path=`${me.id}/${Date.now()}.${ext}`;
      const{error}=await supabase.storage.from("videos").upload(path,mediaFile);
      if(!error){const{data:{publicUrl}}=supabase.storage.from("videos").getPublicUrl(path);await supabase.from("videos").insert({user_id:me.id,caption:text.trim(),video_url:publicUrl});}
    }else{
      let image_url="";
      if(mediaFile){const ext=mediaFile.name.split(".").pop();const path=`${me.id}/${Date.now()}.${ext}`;const{error}=await supabase.storage.from("posts").upload(path,mediaFile);if(!error){const{data:{publicUrl}}=supabase.storage.from("posts").getPublicUrl(path);image_url=publicUrl;}}
      await supabase.from("posts").insert({user_id:me.id,content:text.trim(),image_url});
    }
    setText("");clearMedia();setPosting(false);showNotif("Posted! ✓");load();
  };

  const toggleLike=async item=>{
    const iv=item._t==="video";const tbl=iv?"video_likes":"likes";const idf=iv?"video_id":"post_id";
    const lf=iv?item.video_likes:item.likes;const liked=lf?.some(l=>l.user_id===me.id);
    if(liked)await supabase.from(tbl).delete().eq(idf,item.id).eq("user_id",me.id);
    else await supabase.from(tbl).insert({[idf]:item.id,user_id:me.id});
    load();
  };

  const addComment=async item=>{
    const c=cTexts[item.id]?.trim();if(!c)return;
    const iv=item._t==="video";const tbl=iv?"video_comments":"comments";const idf=iv?"video_id":"post_id";
    await supabase.from(tbl).insert({[idf]:item.id,user_id:me.id,content:c});
    setCTexts(t=>({...t,[item.id]:""}));load();
  };

  return(
    <div className="page">
      <div className="feed-header"><div className="feed-title">Home</div></div>
      <div className="create-post-card">
        <div className="create-row">
          <Avatar profile={me} size={40}/>
          <textarea className="create-input" placeholder={`What's on your mind, ${me.name.split(" ")[0]}?`} value={text} onChange={e=>setText(e.target.value)} rows={text.length>80?3:1}/>
        </div>
        {mediaPreview&&mediaType==="image"&&<div className="image-preview"><img src={mediaPreview} alt=""/><button className="remove-media" onClick={clearMedia}><icons.X/></button></div>}
        {mediaPreview&&mediaType==="video"&&<div className="video-preview"><video src={mediaPreview} controls style={{width:"100%",maxHeight:280}}/><button className="remove-media" onClick={clearMedia}><icons.X/></button></div>}
        <div className="create-actions">
          <button className={`create-btn ${mediaType==="image"?"active-media":""}`} onClick={()=>imgRef.current.click()}><icons.Img/>Photo</button>
          <button className={`create-btn ${mediaType==="video"?"active-media":""}`} onClick={()=>vidRef.current.click()}><icons.Vid/>Video</button>
          <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={pickMedia("image")}/>
          <input ref={vidRef} type="file" accept="video/*" style={{display:"none"}} onChange={pickMedia("video")}/>
          <button className="post-submit" disabled={posting||(!text.trim()&&!mediaFile)} onClick={submit}>{posting?<span className="spinner"/>:"Post"}</button>
        </div>
      </div>
      {posts.length===0&&<div className="empty"><div className="empty-icon">📰</div><div className="empty-text">No posts yet!</div></div>}
      {posts.map(item=>{
        const iv=item._t==="video";const likes=iv?item.video_likes:item.likes;const comments=iv?item.video_comments:item.comments;
        const liked=likes?.some(l=>l.user_id===me.id);const showC=openC[item.id];
        return(
          <div className="post-card" key={item.id}>
            <div className="post-head">
              <Avatar profile={item.profiles} size={40} onClick={()=>goProfile(item.profiles)} viewPic/>
              <div className="post-meta">
                <div className="post-name" onClick={()=>goProfile(item.profiles)}>{item.profiles?.name}</div>
                <div className="post-time">@{item.profiles?.username} · {timeAgo(item.created_at)}</div>
              </div>
            </div>
            {iv&&<span className="video-badge"><icons.Vid/>Short Video</span>}
            {(item.content||item.caption)&&<div className="post-body">{item.content||item.caption}</div>}
            {!iv&&item.image_url&&<img src={item.image_url} alt="" className="post-image"/>}
            {iv&&item.video_url&&<video className="post-video" src={item.video_url} controls preload="metadata"/>}
            <div className="post-actions">
              <button className={`action-btn ${liked?"liked":""}`} onClick={()=>toggleLike(item)}><icons.Heart filled={liked}/>{likes?.length||0}</button>
              <button className="action-btn" onClick={()=>setOpenC(o=>({...o,[item.id]:!o[item.id]}))}><icons.Comment/>{comments?.length||0}</button>
              <button className="action-btn" onClick={()=>{navigator.clipboard?.writeText(window.location.href);showNotif("Link copied! 🔗");}}><icons.Share/></button>
            </div>
            {showC&&<div className="comments-section">
              {comments?.map(c=><div className="comment" key={c.id}><Avatar profile={c.profiles} size={30} onClick={()=>goProfile(c.profiles)}/><div className="comment-bubble"><div className="comment-author">{c.profiles?.name}</div><div className="comment-text">{c.content}</div></div></div>)}
              <div className="comment-input-row">
                <Avatar profile={me} size={30}/>
                <input className="comment-input" placeholder="Write a comment…" value={cTexts[item.id]||""} onChange={e=>setCTexts(t=>({...t,[item.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addComment(item)}/>
                <button className="comment-send" onClick={()=>addComment(item)}>Post</button>
              </div>
            </div>}
          </div>
        );
      })}
    </div>
  );
}

// ── SINGLE REEL ITEM (autoplay + IntersectionObserver) ───────
function ReelItem({ v, me, onLike, onComment, goProfile, commentText, setCommentText }) {
  const videoRef = useRef();
  const wrapRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [showC, setShowC] = useState(false);
  const [muted, setMuted] = useState(true);
  const liked = v.video_likes?.some(l => l.user_id === me.id);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const vid = videoRef.current;
        if (!vid) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          vid.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          vid.pause();
          vid.currentTime = 0;
          setPlaying(false);
        }
      },
      { threshold: 0.7 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setPlaying(true); }
    else { vid.pause(); setPlaying(false); }
  };

  return (
    <div ref={wrapRef} style={{
      position: "relative", width: "100%", height: "calc(100vh - 130px)",
      background: "#000", scrollSnapAlign: "start", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    }}>
      {/* VIDEO — no controls */}
      <video
        ref={videoRef}
        src={v.video_url}
        loop muted={muted}
        playsInline preload="metadata"
        onClick={togglePlay}
        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" }}
      />

      {/* Tap to pause indicator */}
      {!playing && (
        <div onClick={togglePlay} style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          background: "rgba(0,0,0,.45)", borderRadius: "50%", width: 64, height: 64,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)", cursor: "pointer",
        }}>
          <icons.Play />
        </div>
      )}

      {/* Mute toggle top right */}
      <button onClick={() => setMuted(m => !m)} style={{
        position: "absolute", top: 16, right: 16,
        background: "rgba(0,0,0,.4)", border: "none", borderRadius: "50%",
        width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", cursor: "pointer", backdropFilter: "blur(4px)",
      }}>
        {muted
          ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        }
      </button>

      {/* Bottom overlay — caption + user */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 72,
        background: "linear-gradient(transparent, rgba(0,0,0,.75))",
        padding: "40px 16px 20px",
      }}>
        <div onClick={() => goProfile(v.profiles)} style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer",
        }}>
          <Avatar profile={v.profiles} size={34} style={{ border: "2px solid #fff" }} />
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{v.profiles?.name}</div>
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>@{v.profiles?.username}</div>
          </div>
        </div>
        {v.caption && <div style={{ color: "#fff", fontSize: 14, lineHeight: 1.5, marginBottom: 4 }}>{v.caption}</div>}
        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>{timeAgo(v.created_at)}</div>
      </div>

      {/* Right side action buttons */}
      <div style={{
        position: "absolute", right: 12, bottom: 80,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
      }}>
        {/* Like */}
        <button onClick={() => onLike(v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            background: "rgba(0,0,0,.4)", borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: liked ? "var(--accent3)" : "#fff", backdropFilter: "blur(4px)",
          }}>
            <icons.Heart filled={liked} />
          </div>
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{v.video_likes?.length || 0}</span>
        </button>

        {/* Comment */}
        <button onClick={() => setShowC(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            background: "rgba(0,0,0,.4)", borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", backdropFilter: "blur(4px)",
          }}>
            <icons.Comment />
          </div>
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{v.video_comments?.length || 0}</span>
        </button>

        {/* Share */}
        <button onClick={() => { navigator.clipboard?.writeText(window.location.href); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            background: "rgba(0,0,0,.4)", borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", backdropFilter: "blur(4px)",
          }}>
            <icons.Share />
          </div>
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Share</span>
        </button>
      </div>

      {/* Comments drawer */}
      {showC && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "var(--surface)", borderRadius: "20px 20px 0 0",
          padding: "16px", maxHeight: "55%", display: "flex", flexDirection: "column",
          boxShadow: "0 -4px 24px rgba(0,0,0,.2)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Comments</div>
            <button onClick={() => setShowC(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}><icons.X /></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
            {v.video_comments?.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No comments yet</div>}
            {v.video_comments?.map(c => (
              <div className="comment" key={c.id}>
                <Avatar profile={c.profiles} size={30} />
                <div className="comment-bubble">
                  <div className="comment-author">{c.profiles?.name}</div>
                  <div className="comment-text">{c.content}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="comment-input-row">
            <Avatar profile={me} size={30} />
            <input className="comment-input" placeholder="Add a comment…"
              value={commentText || ""}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onComment(v.id)} />
            <button className="comment-send" onClick={() => onComment(v.id)}>Post</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── REELS PAGE ────────────────────────────────────────────────
function ReelsPage({me,showNotif,goProfile}){
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [cTexts, setCTexts] = useState({});
  const fileRef = useRef();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("videos")
      .select("*,profiles(*),video_likes(user_id),video_comments(id,content,created_at,profiles(*))")
      .order("created_at", { ascending: false });
    setVideos(data || []);
  };

  const pickVideo = e => {
    const f = e.target.files[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    const el = document.createElement("video"); el.src = url;
    el.onloadedmetadata = () => {
      if (el.duration > 60) { showNotif("Max 60 seconds!", true); return; }
      setVideoFile(f); setVideoPreview(url);
    };
  };

  const upload = async () => {
    if (!videoFile) return; setUploading(true);
    const ext = videoFile.name.split(".").pop();
    const path = `${me.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("videos").upload(path, videoFile);
    if (error) { showNotif("Upload failed: " + error.message, true); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(path);
    await supabase.from("videos").insert({ user_id: me.id, caption: caption.trim(), video_url: publicUrl });
    setVideoFile(null); setVideoPreview(null); setCaption(""); setUploading(false); setShowUpload(false);
    showNotif("Reel uploaded! 🎬"); load();
  };

  const toggleLike = async v => {
    const liked = v.video_likes?.some(l => l.user_id === me.id);
    if (liked) await supabase.from("video_likes").delete().eq("video_id", v.id).eq("user_id", me.id);
    else await supabase.from("video_likes").insert({ video_id: v.id, user_id: me.id });
    load();
  };

  const addComment = async vid => {
    const c = cTexts[vid]?.trim(); if (!c) return;
    await supabase.from("video_comments").insert({ video_id: vid, user_id: me.id, content: c });
    setCTexts(t => ({ ...t, [vid]: "" })); load();
  };

  return (
    <div style={{ position: "relative" }}>

      {/* Upload button — floating top right */}
      <button onClick={() => setShowUpload(true)} style={{
        position: "fixed", top: 64, right: 20, zIndex: 300,
        background: "var(--accent2)", color: "#fff", border: "none",
        borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 700,
        display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
        boxShadow: "0 4px 16px rgba(61,90,254,.4)",
      }}>
        + Upload
      </button>

      {/* Upload modal */}
      {showUpload && (
        <div className="modal-bg" onClick={() => { setShowUpload(false); setVideoFile(null); setVideoPreview(null); setCaption(""); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">📹 Upload a Reel</div>
            {!videoFile ? (
              <div onClick={() => fileRef.current.click()} style={{
                border: "2px dashed var(--border)", borderRadius: 12, padding: "32px 20px",
                textAlign: "center", cursor: "pointer", marginBottom: 16,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                <div style={{ fontWeight: 600 }}>Tap to choose video</div>
                <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Max 60 seconds</div>
                <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={pickVideo} />
              </div>
            ) : (
              <>
                <video src={videoPreview} controls style={{ width: "100%", maxHeight: 220, borderRadius: 12, marginBottom: 12 }} />
                <input style={{ width: "100%", background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "11px 14px", fontSize: 14, marginBottom: 16, fontFamily: "inherit", outline: "none" }}
                  placeholder="Add a caption…" value={caption} onChange={e => setCaption(e.target.value)} />
              </>
            )}
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => { setShowUpload(false); setVideoFile(null); setVideoPreview(null); setCaption(""); }}>Cancel</button>
              {videoFile && <button className="btn-blue" disabled={uploading} onClick={upload}>{uploading ? "Uploading…" : "Post Reel 🎬"}</button>}
            </div>
          </div>
        </div>
      )}

      {/* Reels feed — full screen vertical scroll snap */}
      {videos.length === 0
        ? <div className="empty" style={{ marginTop: 60 }}><div className="empty-icon">🎬</div><div className="empty-text">No reels yet — be the first!</div></div>
        : <div style={{
            display: "flex", flexDirection: "column",
            overflowY: "scroll", scrollSnapType: "y mandatory",
            height: "calc(100vh - 130px)",
            scrollbarWidth: "none", msOverflowStyle: "none",
          }}>
          {videos.map(v => (
            <ReelItem
              key={v.id} v={v} me={me}
              onLike={toggleLike}
              onComment={addComment}
              goProfile={goProfile}
              commentText={cTexts[v.id]}
              setCommentText={val => setCTexts(t => ({ ...t, [v.id]: val }))}
            />
          ))}
        </div>
      }
    </div>
  );
}

function SearchPage({me,goProfile,showNotif}){
  const[q,setQ]=useState("");const[users,setUsers]=useState([]);const[follows,setFollows]=useState([]);
  useEffect(()=>{loadUsers();loadFollows();},[]);
  const loadUsers=async()=>{const{data}=await supabase.from("profiles").select("*").neq("id",me.id).limit(40);setUsers(data||[]);};
  const loadFollows=async()=>{const{data}=await supabase.from("follows").select("following_id").eq("follower_id",me.id);setFollows((data||[]).map(f=>f.following_id));};
  const toggleFollow=async uid=>{if(follows.includes(uid)){await supabase.from("follows").delete().eq("follower_id",me.id).eq("following_id",uid);setFollows(f=>f.filter(x=>x!==uid));showNotif("Unfollowed");}else{await supabase.from("follows").insert({follower_id:me.id,following_id:uid});setFollows(f=>[...f,uid]);showNotif("Following! 🎉");}};
  const filtered=users.filter(u=>!q||u.name.toLowerCase().includes(q.toLowerCase())||u.username.toLowerCase().includes(q.toLowerCase()));
  return(
    <div className="page-wide">
      <div style={{fontSize:22,fontWeight:700,marginBottom:24}}>Search</div>
      <div className="search-bar-wrap"><span className="search-icon"><icons.Search/></span><input className="search-bar" placeholder="Search people…" value={q} onChange={e=>setQ(e.target.value)}/></div>
      {filtered.length===0?<div className="empty"><div className="empty-icon">🔍</div><div className="empty-text">No users found</div></div>
      :<div className="user-grid">{filtered.map(u=><div className="user-card" key={u.id}><div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Avatar profile={u} size={64} onClick={()=>goProfile(u)}/></div><div className="user-card-name" onClick={()=>goProfile(u)}>{u.name}</div><div className="user-card-handle">@{u.username}</div><button className={`follow-btn ${follows.includes(u.id)?"following":""}`} onClick={()=>toggleFollow(u.id)}>{follows.includes(u.id)?"Following":"Follow"}</button></div>)}</div>}
    </div>
  );
}

function MessagesPage({me,goProfile}){
  const [users,setUsers]=useState([]);
  const [active,setActive]=useState(null);
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [search,setSearch]=useState("");
  const endRef=useRef();

  useEffect(()=>{supabase.from("profiles").select("*").neq("id",me.id).then(({data})=>setUsers(data||[]));},[]);

  useEffect(()=>{
    if(!active)return;
    loadMsgs();
  },[active]);

  const loadMsgs=async()=>{
    const{data}=await supabase.from("messages").select("*")
      .or(`and(sender_id.eq.${me.id},receiver_id.eq.${active.id}),and(sender_id.eq.${active.id},receiver_id.eq.${me.id})`)
      .order("created_at",{ascending:true});
    setMsgs(data||[]);
  };

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const send=async()=>{
    if(!input.trim()||!active)return;
    const content=input.trim(); setInput("");
    await supabase.from("messages").insert({sender_id:me.id,receiver_id:active.id,content});
    loadMsgs();
  };

  // Group consecutive messages from same sender
  const grouped=[];
  msgs.forEach((m,i)=>{
    const prev=msgs[i-1];
    if(prev&&prev.sender_id===m.sender_id){
      grouped[grouped.length-1].bubbles.push(m);
    } else {
      grouped.push({sender_id:m.sender_id,bubbles:[m]});
    }
  });

  const filtered=users.filter(u=>!search||u.name.toLowerCase().includes(search.toLowerCase())||u.username.toLowerCase().includes(search.toLowerCase()));

  return(
    <div className="page-wide" style={{padding:0}}>
      <div className="ig-messages">

        {/* LEFT — convo list */}
        <div className="ig-convo-list">
          <div className="ig-convo-header">Messages</div>
          <div className="ig-convo-search">
            <input placeholder="Search people…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="ig-convo-items">
            {filtered.length===0&&<div style={{padding:"20px",textAlign:"center",color:"var(--muted)",fontSize:13}}>No users found</div>}
            {filtered.map(u=>(
              <div className={`ig-convo-item ${active?.id===u.id?"active":""}`} key={u.id} onClick={()=>setActive(u)}>
                <Avatar profile={u} size={48} viewPic />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14}}>{u.name}</div>
                  <div style={{fontSize:12,color:"var(--muted)",marginTop:1}}>@{u.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — chat area */}
        {active ? (
          <div className="ig-chat">
            {/* Chat header */}
            <div className="ig-chat-header">
              <Avatar profile={active} size={42} viewPic style={{border:"2px solid var(--border)"}}/>
              <div className="ig-chat-header-info">
                <div className="ig-chat-header-name" onClick={()=>goProfile(active)} style={{cursor:"pointer"}}>{active.name}</div>
                <div className="ig-chat-header-handle">@{active.username}</div>
              </div>
              <button onClick={()=>goProfile(active)} style={{background:"none",border:"1.5px solid var(--border)",borderRadius:999,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer",color:"var(--text)"}}>
                View Profile
              </button>
            </div>

            {/* Messages */}
            <div className="ig-chat-messages">
              {msgs.length===0&&(
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"var(--muted)",gap:12,paddingTop:60}}>
                  <Avatar profile={active} size={72} viewPic style={{border:"3px solid var(--border)"}}/>
                  <div style={{fontWeight:700,fontSize:16,color:"var(--text)"}}>{active.name}</div>
                  <div style={{fontSize:13}}>Say hi to start the conversation 👋</div>
                </div>
              )}
              {grouped.map((g,gi)=>{
                const isMine=g.sender_id===me.id;
                const sender=isMine?me:active;
                return(
                  <div key={gi} className={`ig-msg-group ${isMine?"mine":"other"}`}>
                    {!isMine&&<Avatar profile={sender} size={28} viewPic style={{marginTop:"auto",flexShrink:0}}/>}
                    <div className="ig-msg-bubbles">
                      {g.bubbles.map((m,bi)=>(
                        <div key={m.id} className={`ig-bubble ${isMine?"mine":"other"}`}
                          style={{
                            borderRadius: g.bubbles.length===1 ? 20 :
                              isMine
                                ? `20px 20px ${bi===g.bubbles.length-1?"4px":"20px"} 20px`
                                : `20px 20px 20px ${bi===g.bubbles.length-1?"4px":"20px"}`,
                          }}>
                          {m.content}
                        </div>
                      ))}
                      <div className="ig-msg-time">{timeAgo(g.bubbles[g.bubbles.length-1].created_at)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef}/>
            </div>

            {/* Input */}
            <div className="ig-chat-input">
              <Avatar profile={me} size={32}/>
              <input
                placeholder={`Message ${active.name.split(" ")[0]}…`}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&send()}
              />
              <button className="ig-send-btn" onClick={send}><icons.Send/></button>
            </div>
          </div>
        ) : (
          <div className="ig-no-chat">
            <div style={{fontSize:48,marginBottom:8}}>💬</div>
            <div style={{fontWeight:700,fontSize:16}}>Your Messages</div>
            <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>Select a person to start chatting</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfilePage({userId,me,isOwn,goProfile,showNotif}){
  const[profile,setP]=useState(null);const[posts,setPosts]=useState([]);const[videos,setVideos]=useState([]);
  const[followers,setFollowers]=useState(0);const[following,setFollowing]=useState(0);const[isFollowing,setIsFollowing]=useState(false);const[tab,setTab]=useState("posts");
  useEffect(()=>{load();},[userId]);
  const load=async()=>{
    const[{data:p},{data:ps},{data:vs},{count:fc},{count:fg},{data:fck}]=await Promise.all([
      supabase.from("profiles").select("*").eq("id",userId).single(),
      supabase.from("posts").select("*,likes(user_id),comments(id)").eq("user_id",userId).order("created_at",{ascending:false}),
      supabase.from("videos").select("*,video_likes(user_id),video_comments(id)").eq("user_id",userId).order("created_at",{ascending:false}),
      supabase.from("follows").select("*",{count:"exact",head:true}).eq("following_id",userId),
      supabase.from("follows").select("*",{count:"exact",head:true}).eq("follower_id",userId),
      supabase.from("follows").select("id").eq("follower_id",me.id).eq("following_id",userId),
    ]);
    setP(p);setPosts(ps||[]);setVideos(vs||[]);setFollowers(fc||0);setFollowing(fg||0);setIsFollowing((fck||[]).length>0);
  };
  const toggleFollow=async()=>{
    if(isFollowing){await supabase.from("follows").delete().eq("follower_id",me.id).eq("following_id",userId);setIsFollowing(false);setFollowers(f=>f-1);showNotif("Unfollowed");}
    else{await supabase.from("follows").insert({follower_id:me.id,following_id:userId});setIsFollowing(true);setFollowers(f=>f+1);showNotif(`Following ${profile?.name}! 🎉`);}
  };
  if(!profile)return<div className="empty"><div className="spinner dark"/></div>;
  return(
    <div className="page-wide">
      <div className="profile-card">
        <div className="profile-cover"/>
        <div className="profile-info">
          <div className="profile-avatar-wrap"><Avatar profile={profile} size={80} viewPic style={{border:"4px solid var(--surface)"}}/><div className="profile-actions">{!isOwn&&<button className={isFollowing?"btn-outline":"btn-blue"} onClick={toggleFollow}>{isFollowing?"Following":"Follow"}</button>}{isOwn&&<button className="btn-outline">Edit Profile</button>}</div></div>
          <div className="profile-name">{profile.name}</div><div className="profile-handle">@{profile.username}</div>
          {profile.bio&&<div className="profile-bio">{profile.bio}</div>}
          <div className="profile-stats"><div><div className="stat-num">{posts.length+videos.length}</div><div className="stat-label">Posts</div></div><div><div className="stat-num">{followers}</div><div className="stat-label">Followers</div></div><div><div className="stat-num">{following}</div><div className="stat-label">Following</div></div></div>
        </div>
      </div>
      <div className="profile-tabs">{["posts","reels"].map(t=><div key={t} className={`profile-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}</div>
      {tab==="posts"&&(posts.length===0?<div className="empty"><div className="empty-icon">📝</div><div className="empty-text">No posts yet</div></div>:posts.map(p=><div className="post-card" key={p.id}>{p.content&&<div className="post-body" style={{paddingTop:16}}>{p.content}</div>}{p.image_url&&<img src={p.image_url} alt="" className="post-image"/>}<div className="post-actions"><span className="action-btn"><icons.Heart/>{p.likes?.length||0}</span><span className="action-btn"><icons.Comment/>{p.comments?.length||0}</span></div></div>))}
      {tab==="reels"&&(videos.length===0?<div className="empty"><div className="empty-icon">🎬</div><div className="empty-text">No reels yet</div></div>:<div className="reels-grid">{videos.map(v=><div className="reel-card" key={v.id}><video src={v.video_url} controls preload="metadata" style={{width:"100%",height:"100%",objectFit:"cover"}}/><div className="reel-overlay"><div className="reel-caption">{v.caption||"No caption"}</div><div className="reel-meta"><icons.Heart/>{v.video_likes?.length||0}&nbsp;<icons.Comment/>{v.video_comments?.length||0}</div></div></div>)}</div>)}
    </div>
  );
}

// ── CHEVRON ICON ─────────────────────────────────────────────
const ChevronRight = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>;
const ChevronLeft  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;

// ── ACCOUNT DELETION SUB-PAGE ─────────────────────────────────
function AccountDeletionPage({ me, logout, onBack }) {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return setErr('Please type DELETE in capitals to confirm.');
    if (!password) return setErr("Please enter your password.");
    setBusy(true); setErr("");
    // Re-authenticate first
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password });
    if (signInErr) { setErr("Incorrect password. Try again."); setBusy(false); return; }
    // Delete profile (cascade deletes everything)
    await supabase.from("profiles").delete().eq("id", me.id);
    await supabase.auth.signOut();
    logout();
  };

  return (
    <div className="page">
      {/* Back button */}
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,color:"var(--muted)",fontSize:14,fontWeight:600,background:"none",border:"none",cursor:"pointer",marginBottom:24,padding:0}}>
        <ChevronLeft/> Back to Settings
      </button>

      <div style={{fontSize:22,fontWeight:700,marginBottom:4}}>Account Deletion</div>
      <div style={{fontSize:14,color:"var(--muted)",marginBottom:28}}>This action is permanent and cannot be undone.</div>

      {/* Step 1 — Warning */}
      {step === 1 && (
        <>
          <div style={{background:"#fff8f0",border:"1.5px solid #ffd6a5",borderRadius:"var(--radius)",padding:24,marginBottom:20}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:12,color:"#c05c00"}}>⚠️ Before you delete your account</div>
            <div style={{fontSize:14,color:"#7a4000",lineHeight:1.8}}>
              Deleting your account will permanently remove:<br/>
              • Your profile and username<br/>
              • All your posts and videos<br/>
              • All your likes and comments<br/>
              • All your messages and conversations<br/>
              • All your followers and following<br/><br/>
              <strong>This cannot be reversed. Ever.</strong>
            </div>
          </div>
          <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--radius)",padding:24,marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Consider these alternatives first:</div>
            <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.9}}>
              • 🔒 Change your password if your account was compromised<br/>
              • 👤 Update your username and bio for a fresh start<br/>
              • 🔕 Simply stop using the app — your data stays safe
            </div>
          </div>
          <button onClick={()=>setStep(2)} style={{width:"100%",padding:"14px",background:"var(--bg)",border:"1.5px solid var(--border)",borderRadius:"var(--radius)",fontSize:15,fontWeight:600,color:"var(--text)",cursor:"pointer",marginBottom:12}}>
            I understand, continue anyway →
          </button>
        </>
      )}

      {/* Step 2 — Confirm */}
      {step === 2 && (
        <>
          <div style={{background:"#fff0f2",border:"1.5px solid #ffd0d8",borderRadius:"var(--radius)",padding:24,marginBottom:24}}>
            <div style={{fontSize:15,fontWeight:700,color:"var(--accent3)",marginBottom:16}}>🗑️ Confirm Account Deletion</div>

            <div style={{fontSize:13,fontWeight:600,color:"var(--muted)",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Type DELETE to confirm</div>
            <input
              style={{width:"100%",background:"var(--bg)",border:`1.5px solid ${confirmText==="DELETE"?"var(--green)":"var(--border)"}`,borderRadius:10,padding:"11px 14px",fontSize:15,marginBottom:20,fontFamily:"inherit",outline:"none",transition:"border .2s"}}
              placeholder='Type DELETE here'
              value={confirmText}
              onChange={e=>setConfirmText(e.target.value)}
            />

            <div style={{fontSize:13,fontWeight:600,color:"var(--muted)",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Enter your password</div>
            <input
              type="password"
              style={{width:"100%",background:"var(--bg)",border:"1.5px solid var(--border)",borderRadius:10,padding:"11px 14px",fontSize:15,marginBottom:20,fontFamily:"inherit",outline:"none"}}
              placeholder="Your current password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
            />

            {err && <div style={{color:"var(--accent3)",fontSize:13,marginBottom:12}}>{err}</div>}

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:"12px",background:"var(--bg)",border:"1.5px solid var(--border)",borderRadius:"var(--radius-sm)",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                Go Back
              </button>
              <button
                onClick={handleDelete}
                disabled={busy || confirmText !== "DELETE" || !password}
                style={{flex:1,padding:"12px",background:confirmText==="DELETE"&&password?"var(--accent3)":"#ffd0d8",color:confirmText==="DELETE"&&password?"#fff":"#ffaab8",border:"none",borderRadius:"var(--radius-sm)",fontSize:14,fontWeight:700,cursor:confirmText==="DELETE"&&password?"pointer":"not-allowed",transition:"all .2s"}}>
                {busy ? <span className="spinner"/> : "🗑️ Delete Forever"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── SETTINGS MAIN PAGE ────────────────────────────────────────
function SettingsPage({me,setProfile,showNotif,logout}){
  const [subPage, setSubPage] = useState(null); // null = main settings
  const [form,setForm]=useState({name:me.name,username:me.username,bio:me.bio||""});
  const [passwords,setPw]=useState({newPw:"",confirm:""});
  const [saving,setSaving]=useState(false);
  const fileRef=useRef();
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const setP=k=>e=>setPw(p=>({...p,[k]:e.target.value}));
  const saveProfile=async()=>{setSaving(true);const{data,error}=await supabase.from("profiles").update({name:form.name,username:form.username.toLowerCase(),bio:form.bio}).eq("id",me.id).select().single();if(error)showNotif(error.message,true);else{setProfile(data);showNotif("Profile updated ✓");}setSaving(false);};
  const changePw=async()=>{if(!passwords.newPw)return showNotif("Enter a new password",true);if(passwords.newPw!==passwords.confirm)return showNotif("Passwords don't match",true);const{error}=await supabase.auth.updateUser({password:passwords.newPw});if(error)showNotif(error.message,true);else{showNotif("Password updated ✓");setPw({newPw:"",confirm:""});}};
  const uploadAvatar=async e=>{const file=e.target.files[0];if(!file)return;const ext=file.name.split(".").pop();const path=`${me.id}/avatar.${ext}`;await supabase.storage.from("avatars").upload(path,file,{upsert:true});const{data:{publicUrl}}=supabase.storage.from("avatars").getPublicUrl(path);const{data,error}=await supabase.from("profiles").update({avatar_url:publicUrl+"?t="+Date.now()}).eq("id",me.id).select().single();if(!error){setProfile(data);showNotif("Avatar updated ✓");}};

  // Show sub-page if active
  if (subPage === "delete") return <AccountDeletionPage me={me} logout={logout} onBack={()=>setSubPage(null)} />;

  return(
    <div className="page">
      <div style={{fontSize:22,fontWeight:700,marginBottom:24}}>Settings</div>

      {/* Profile */}
      <div className="settings-section">
        <div className="settings-title">👤 Profile</div>
        <div className="settings-row"><div><div className="settings-label">Profile Picture</div><div className="settings-sub">JPG or PNG</div></div><div style={{display:"flex",alignItems:"center",gap:12}}><Avatar profile={me} size={48}/><button className="btn-outline" style={{fontSize:13,padding:"8px 14px"}} onClick={()=>fileRef.current.click()}>Change</button><input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={uploadAvatar}/></div></div>
        <div className="settings-row"><div className="settings-label">Full Name</div><input className="settings-input" value={form.name} onChange={set("name")}/></div>
        <div className="settings-row"><div className="settings-label">Username</div><input className="settings-input" value={form.username} onChange={set("username")}/></div>
        <div className="settings-row"><div className="settings-label">Bio</div><input className="settings-input" value={form.bio} onChange={set("bio")} placeholder="Tell people about yourself…"/></div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><button className="btn-save" disabled={saving} onClick={saveProfile}>{saving?<span className="spinner"/>:"Save Changes"}</button></div>
      </div>

      {/* Password */}
      <div className="settings-section">
        <div className="settings-title">🔒 Change Password</div>
        <div className="settings-row"><div className="settings-label">New Password</div><input className="settings-input" type="password" placeholder="••••••••" value={passwords.newPw} onChange={setP("newPw")}/></div>
        <div className="settings-row"><div className="settings-label">Confirm Password</div><input className="settings-input" type="password" placeholder="••••••••" value={passwords.confirm} onChange={setP("confirm")}/></div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><button className="btn-save" onClick={changePw}>Update Password</button></div>
      </div>

      {/* More Options — Account Deletion hidden inside */}
      <div className="settings-section">
        <div className="settings-title">⚙️ More Options</div>
        <div className="settings-row" style={{cursor:"pointer"}} onClick={()=>setSubPage("delete")}>
          <div>
            <div className="settings-label" style={{color:"var(--muted)"}}>Account Deletion</div>
            <div className="settings-sub">Manage account removal options</div>
          </div>
          <ChevronRight/>
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"16px",borderRadius:"var(--radius)",background:"#fff0f2",border:"1.5px solid #ffd0d8",color:"var(--accent3)",fontWeight:700,fontSize:15,marginBottom:32,transition:"all .18s"}}
        onMouseOver={e=>{e.currentTarget.style.background="var(--accent3)";e.currentTarget.style.color="#fff";}}
        onMouseOut={e=>{e.currentTarget.style.background="#fff0f2";e.currentTarget.style.color="var(--accent3)";}}>
        <icons.Logout/> Log Out
      </button>
    </div>
  );
}
