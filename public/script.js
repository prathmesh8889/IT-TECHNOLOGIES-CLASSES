const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", () => navMenu.classList.toggle("open"));
  navMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navMenu.classList.remove("open")));
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const form = document.getElementById("enquiryForm");
const formMessage = document.getElementById("formMessage");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMessage.textContent = "Submitting...";
    formMessage.className = "form-message";
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Could not submit enquiry.");
      form.reset();
      formMessage.textContent = "Enquiry submitted successfully. We will contact you soon.";
      formMessage.className = "form-message ok";
    } catch (err) {
      formMessage.textContent = err.message;
      formMessage.className = "form-message err";
    }
  });
}
