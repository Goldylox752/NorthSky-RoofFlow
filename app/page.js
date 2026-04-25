<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>RoofFlow | We Book Roofing Jobs For You</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">

<style>
body{
  font-family:Inter,sans-serif;
  margin:0;
  background:#0b1220;
  color:#fff;
}

.container{
  max-width:1100px;
  margin:auto;
  padding:40px 20px;
}

.hero{
  text-align:center;
  padding:90px 20px 50px;
}

h1{
  font-size:48px;
  font-weight:800;
  line-height:1.05;
}

p{
  opacity:.85;
  max-width:750px;
  margin:15px auto;
  font-size:16px;
}

.badge{
  display:inline-block;
  background:#1e293b;
  padding:6px 12px;
  border-radius:999px;
  font-size:12px;
  margin-bottom:15px;
}

.card{
  background:#121a2b;
  border:1px solid #24314d;
  border-radius:16px;
  padding:25px;
  margin:20px 0;
}

.btn{
  background:#4f46e5;
  padding:14px;
  border-radius:10px;
  color:#fff;
  font-weight:700;
  text-decoration:none;
  display:inline-block;
  margin-top:12px;
  width:100%;
  text-align:center;
}

.btn:hover{background:#6366f1}

.section-title{font-size:22px;margin-bottom:10px}

ul{padding-left:20px;opacity:.9}

.small{font-size:13px;opacity:.6}

.footer{
  text-align:center;
  opacity:.4;
  font-size:12px;
  margin-top:50px;
}

.sticky-cta{
  position:fixed;
  bottom:20px;
  right:20px;
  width:180px;
  z-index:999;
}
</style>
</head>

<body>

<div class="container">

<!-- HERO -->
<div class="hero">
  <div class="badge">RoofFlow — Roofing Job Booking System</div>

  <h1>We Book Roofing Jobs<br/>Directly Into Your Calendar</h1>

  <p>
    No shared leads. No chasing homeowners. No competition.
    <br/><br/>
    <b>Just qualified roofing appointments sent directly to you.</b>
  </p>

  <a href="/apply/" class="btn" onclick="trackCTA('apply_click')">
    Apply For Your City
  </a>

  <p class="small">We only onboard a limited number of contractors per city.</p>
</div>

<!-- WHO -->
<div class="card">
  <div class="section-title">Who This Is For</div>
  <ul>
    <li>Roofing contractors already doing consistent jobs</li>
    <li>Companies spending on ads or lead platforms</li>
    <li>Teams who want predictable booked work</li>
  </ul>
</div>

<!-- PROBLEM -->
<div class="card">
  <div class="section-title">Why Contractors Stay Stuck</div>
  <ul>
    <li>Leads are shared with competitors</li>
    <li>You must respond instantly to compete</li>
    <li>Most leads are not serious buyers</li>
  </ul>
</div>

<!-- SOLUTION -->
<div class="card">
  <div class="section-title">What We Do Instead</div>
  <ul>
    <li>Filter homeowners before you see them</li>
    <li>Pre-qualify every opportunity</li>
    <li>Book confirmed appointments only</li>
  </ul>
</div>

<!-- PROCESS -->
<div class="card">
  <div class="section-title">How It Works</div>
  <ul>
    <li>Homeowner submits request</li>
    <li>Lead gets qualified</li>
    <li>Appointment is booked for you</li>
  </ul>
</div>

<!-- PRICING -->
<div class="card" style="text-align:center">
  <h2>Simple Pricing</h2>

  <p><b>$1,000 setup + $150 per booked appointment</b></p>

  <a href="/apply/" class="btn" onclick="trackCTA('apply_click')">
    Apply Now
  </a>
</div>

<!-- FINAL CTA -->
<div class="card" style="text-align:center">
  <h2>Ready to Get Consistent Roofing Jobs?</h2>

  <a href="/apply/" class="btn" onclick="trackCTA('final_apply_click')">
    Apply Now
  </a>
</div>

<div class="footer">
  RoofFlow © 2026
</div>

</div>

<!-- Sticky CTA -->
<div class="sticky-cta">
  <a class="btn" href="/apply/" onclick="trackCTA('sticky_apply_click')">
    Apply Now
  </a>
</div>

<script>
function trackCTA(name){
  fetch("/api/event", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      event: name,
      page: window.location.pathname,
      ts: Date.now()
    })
  }).catch(() => {});
}
</script>

</body>
</html>
