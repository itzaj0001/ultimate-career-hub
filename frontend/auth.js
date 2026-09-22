(() => {
const publicPages = ["", "index.html", "login.html", "signup.html", "contact.html"];
const currentPage = window.location.pathname.split("/").pop();

function getLoggedInUser() {
  try {
    return JSON.parse(sessionStorage.getItem("loggedInUser"));
  } catch (error) {
    return null;
  }
}

function getInitials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function buildAvatar(user) {
  if (user?.picture) {
    return `<img src="${user.picture}" alt="${user.name || "Profile"} picture">`;
  }

  return `<i class="fas fa-user"></i>`;
}

function getNavLinkClass(page) {
  const isHome = page === "index.html" && (currentPage === "" || currentPage === "index.html");
  const isActive = isHome || currentPage === page;

  return isActive ? ' class="active-nav-link" aria-current="page"' : "";
}

function buildNavbar(user) {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const links = `
    <a href="index.html"${getNavLinkClass("index.html")}>Home</a>
    <a href="roadmap.html"${getNavLinkClass("roadmap.html")}>Roadmaps</a>
    <a href="jobs.html"${getNavLinkClass("jobs.html")}>Opportunities</a>
    <a href="interview.html"${getNavLinkClass("interview.html")}>Interview Prep</a>
    <a href="resume.html"${getNavLinkClass("resume.html")}>Resume Tools</a>
    <a href="chatbot.html"${getNavLinkClass("chatbot.html")}>Mock Interview</a>
    <a href="coding.html"${getNavLinkClass("coding.html")}>Coding</a>
    <a href="contact.html"${getNavLinkClass("contact.html")}>Contact</a>`;

  const accountControl = user ? `
    <div class="profile-menu">
      <button class="profile-toggle" id="profileToggle" type="button" aria-expanded="false" aria-label="Open profile menu">
        <span class="profile-avatar">${buildAvatar(user)}</span>
        <span class="profile-name">${user?.name || "Profile"}</span>
        <i class="fas fa-chevron-down"></i>
      </button>
      <div class="profile-dropdown" id="profileDropdown">
        <div class="profile-summary">
          <span class="profile-avatar large">${buildAvatar(user)}</span>
          <strong>${user?.name || "User"}</strong>
          <small>${user?.email || ""}</small>
          ${user?.bio ? `<p class="profile-bio">${user.bio}</p>` : ""}
        </div>
        <a href="dashboard.html"><i class="fas fa-chart-line"></i> Profile Dashboard</a>
        <button type="button" id="editProfileBtn"><i class="fas fa-user-pen"></i> Edit Profile</button>
        <button type="button" id="logoutBtn"><i class="fas fa-right-from-bracket"></i> Logout</button>
      </div>
    </div>` : `
    <div class="guest-nav-actions">
      <a href="login.html" class="nav-login-link">Login</a>
      <a href="login.html#signup" class="nav-auth-link">Sign Up</a>
    </div>`;

  nav.className = user ? "site-nav logged-in" : "site-nav logged-out";
  nav.innerHTML = `
    <a href="index.html" class="nav-brand" aria-label="Ultimate Career Hub home"><span class="brand-mark"><i class="fas fa-compass"></i></span><span>Ultimate <b>Career Hub</b></span></a>
    <button class="nav-toggle" type="button" aria-controls="primaryNavigation" aria-expanded="false" aria-label="Open navigation"><i class="fas fa-bars"></i></button>
    <div class="nav-menu" id="primaryNavigation">
      <div class="nav-links">${links}</div>
      ${accountControl}
    </div>`;
}

function bindNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  toggle?.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function bindProfileMenu() {
  const toggle = document.getElementById("profileToggle");
  const dropdown = document.getElementById("profileDropdown");
  const editButton = document.getElementById("editProfileBtn");
  const logoutButton = document.getElementById("logoutBtn");

  toggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown?.classList.toggle("show");
    toggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".profile-menu")) {
      dropdown?.classList.remove("show");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });

  editButton?.addEventListener("click", () => {
    dropdown?.classList.remove("show");
    openProfileModal();
  });

  logoutButton?.addEventListener("click", logoutUser);
}

function openProfileModal() {
  const user = getLoggedInUser();
  if (!user) return;

  let modal = document.getElementById("profileModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "profileModal";
    modal.className = "profile-modal hidden";
    modal.innerHTML = `
      <div class="profile-modal-content">
        <button class="profile-modal-close" type="button" aria-label="Close profile editor">&times;</button>
        <h2>Edit Profile</h2>
        <form id="profileForm" class="profile-form">
          <div class="profile-picture-editor">
            <div class="profile-picture-preview" id="profilePicturePreview"></div>
            <div class="profile-picture-actions">
              <label class="profile-icon-button" for="profilePicture" title="Upload picture" aria-label="Upload picture">
                <i class="fas fa-upload"></i>
              </label>
              <button class="profile-icon-button" type="button" id="deleteProfilePicture" title="Delete picture" aria-label="Delete picture">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <label for="profileName">Name</label>
          <input type="text" id="profileName" required>
          <label for="profileEmail">Email</label>
          <input type="email" id="profileEmail" required>
          <label for="profileBio">Bio</label>
          <textarea id="profileBio" rows="4" placeholder="Write a short bio about yourself"></textarea>
          <input type="file" id="profilePicture" accept="image/*" hidden>
          <button type="submit" class="btn search-btn">Save Profile</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".profile-modal-close").addEventListener("click", closeProfileModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeProfileModal();
    });
    modal.querySelector("#profileForm").addEventListener("submit", saveProfile);
    modal.querySelector("#profilePicture").addEventListener("change", previewProfilePicture);
    modal.querySelector("#deleteProfilePicture").addEventListener("click", deleteProfilePicture);
  }

  modal.querySelector("#profileName").value = user.name || "";
  modal.querySelector("#profileEmail").value = user.email || "";
  modal.querySelector("#profileBio").value = user.bio || "";
  modal.querySelector("#profilePicture").value = "";
  modal.dataset.picture = user.picture || "";
  renderProfilePicturePreview(user.picture);
  modal.classList.remove("hidden");
}

function closeProfileModal() {
  document.getElementById("profileModal")?.classList.add("hidden");
}

function renderProfilePicturePreview(picture) {
  const preview = document.getElementById("profilePicturePreview");
  if (!preview) return;

  preview.innerHTML = picture
    ? `<img src="${picture}" alt="Profile picture preview">`
    : `<i class="fas fa-user"></i>`;
}

function previewProfilePicture(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const modal = document.getElementById("profileModal");
    modal.dataset.picture = reader.result;
    renderProfilePicturePreview(reader.result);
  };
  reader.readAsDataURL(file);
}

function deleteProfilePicture() {
  const modal = document.getElementById("profileModal");
  const pictureInput = document.getElementById("profilePicture");

  if (modal) modal.dataset.picture = "";
  if (pictureInput) pictureInput.value = "";
  renderProfilePicturePreview("");
}

function saveProfile(event) {
  event.preventDefault();

  const existingUser = getLoggedInUser();
  if (!existingUser) return;

  const name = document.getElementById("profileName").value.trim();
  const email = document.getElementById("profileEmail").value.trim();
  const bio = document.getElementById("profileBio").value.trim();
  const picture = document.getElementById("profileModal").dataset.picture || "";
  const updatedUser = { ...existingUser, name, email, bio, picture };
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  let userUpdated = false;
  const updatedUsers = users.map((user) => {
    if (user.email !== existingUser.email) return user;

    userUpdated = true;
    return { ...user, ...updatedUser };
  });

  if (!userUpdated) {
    updatedUsers.push(updatedUser);
  }

  sessionStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
  localStorage.setItem("users", JSON.stringify(updatedUsers));
  closeProfileModal();
  buildNavbar(updatedUser);
  bindNavigation();
  bindProfileMenu();
  alert("Profile updated successfully!");
}

function logoutUser() {
  sessionStorage.removeItem("loggedInUser");
  localStorage.removeItem("loggedInUser");
  alert("Logged out successfully!");
  window.location.href = "index.html";
}

const user = getLoggedInUser();

if (!publicPages.includes(currentPage) && !user) {
  alert("Please login to view this page.");
  window.location.href = "login.html";
}

function initializeAuthNavbar() {
  const activeUser = getLoggedInUser();
  document.body.classList.add(`page-${(currentPage || "index.html").replace(".html", "")}`);
  buildNavbar(activeUser);
  bindNavigation();
  bindProfileMenu();
  updateGuestHomeCard(activeUser);
}

function updateGuestHomeCard(user) {
  const card = document.querySelector(".guest-auth-card");
  if (card) card.style.display = user ? "none" : "block";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAuthNavbar);
} else {
  initializeAuthNavbar();
}
})();
