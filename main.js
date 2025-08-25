import httpRequest from "./utils/httpRequest.js"

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
    const signupBtn = $(".signup-btn")
    const loginBtn = $(".login-btn")
    const authModal = $("#authModal")
    const modalClose = $("#modalClose")
    const signupForm = $("#signupForm")
    const loginForm = $("#loginForm")
    const showLoginBtn = $("#showLogin")
    const showSignupBtn = $("#showSignup")
    const controlBtns = $$(".control-btn")
    const toggleShowPassword = $$(".password-show")
    const logoutBtn = $("#logoutBtn")

    // Function to show signup form
    function showSignupForm() {
        signupForm.style.display = "block"
        loginForm.style.display = "none"
    }

    // Function to show login form
    function showLoginForm() {
        signupForm.style.display = "none"
        loginForm.style.display = "block"
    }

    // Function to open modal
    function openModal() {
        authModal.classList.add("show")
        document.body.style.overflow = "hidden" // Prevent background scrolling
    }
    // Fucntion hide or show password when sign up
    toggleShowPassword.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const passwordInput = btn.previousElementSibling
            const icon = btn.querySelector("i")
            if (passwordInput.type === "password") {
                passwordInput.type = "text"
                icon.classList.remove("fa-eye-slash")
                icon.classList.add("fa-eye")
            } else {
                passwordInput.type = "password"
                icon.classList.remove("fa-eye")
                icon.classList.add("fa-eye-slash")
            }
        })
    })
    // Open modal with Sign Up form when clicking Sign Up button
    signupBtn.addEventListener("click", function () {
        const inputMail = signupForm.querySelector("#signupEmail")
        const inputPassword = signupForm.querySelector("#signupPassword")
        showSignupForm()
        openModal()
        CheckValidEmail(inputMail)
        CheckValidPassword(inputPassword)
    })

    // Open modal with Login form when clicking Login button
    loginBtn.addEventListener("click", function () {
        const inputMail = loginForm.querySelector("#loginEmail")
        const inputPassword = loginForm.querySelector("#loginPassword")
        showLoginForm()
        openModal()
        CheckValidEmail(inputMail)
        CheckValidPassword(inputPassword)
    })

    // Close modal function
    function closeModal() {
        authModal.classList.remove("show")
        document.body.style.overflow = "auto" // Restore scrolling
    }

    // Close modal when clicking close button
    modalClose.addEventListener("click", closeModal)

    // Close modal when clicking overlay (outside modal container)
    authModal.addEventListener("click", function (e) {
        if (e.target === authModal) {
            closeModal()
        }
    })

    // Close modal with Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && authModal.classList.contains("show")) {
            closeModal()
        }
    })

    // Switch to Login form
    showLoginBtn.addEventListener("click", function () {
        showLoginForm()
    })

    // Switch to Signup form
    showSignupBtn.addEventListener("click", function () {
        showSignupForm()
    })
    // Sign Up Form - attach once
    let isSigningUp = false
    signupForm
        .querySelector(".auth-form-content")
        .addEventListener("submit", async (e) => {
            e.preventDefault()
            if (isSigningUp) return
            isSigningUp = true
            const displayName = signupForm.querySelector("#signupDisplayName").value
            const email = signupForm.querySelector("#signupEmail").value
            const password = signupForm.querySelector("#signupPassword").value
            const username = email.split("@")[0]
            const credentials = {
                username,
                email,
                password,
                display_name: displayName,
            }

            try {
                const { user, tokens } = await httpRequest.post(
                    "auth/register",
                    credentials
                )
                localStorage.setItem("accessToken", tokens.access_token)
                localStorage.setItem("currentUser", JSON.stringify(user))
                updateCurrentUser(user)
            } catch (error) {
                if (error?.response?.error?.code === "EMAIL_EXISTS") {
                    const email = signupForm.querySelector("#signupEmail")
                    console.log(email)
                    const formGroup = email.parentNode
                    console.log(formGroup)
                    const errorMessage = formGroup.querySelector(".error-message")
                    console.log(errorMessage)
                    const errorSpan = errorMessage.querySelector("span")
                    formGroup.classList.add("invalid")
                    errorSpan.textContent = "Email đã có người dùng!"
                }
            } finally {
                isSigningUp = false
            }
        })

    // Login Form - attach once
    let isLoggingIn = false
    loginForm
        .querySelector(".auth-form-content")
        .addEventListener("submit", async (e) => {
            e.preventDefault()
            if (isLoggingIn) return
            isLoggingIn = true
            const email = loginForm.querySelector("#loginEmail").value
            const password = loginForm.querySelector("#loginPassword").value
            try {
                const { user, access_token } = await httpRequest.post("auth/login", {
                    email,
                    password,
                })
                localStorage.setItem("accessToken", access_token)
                localStorage.setItem("currentUser", JSON.stringify(user))
                updateCurrentUser(user)
                closeModal()
                {
                    const name = user.display_name || user.username || ""
                    showToast({
                        title: "Login successful",
                        message: "Welcome back" + (name ? ", " + name : "") + "!",
                        type: "success",
                        duration: 3000,
                    })
                }
                location.reload()
            } catch (error) {
                throw error
            } finally {
                isLoggingIn = false
            }
        })

    // Control Buttons Toggle Active Status
    controlBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("active")
        })
    })
})

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
    const userAvatar = document.getElementById("userAvatar")
    const userDropdown = document.getElementById("userDropdown")
    const logoutBtn = document.getElementById("logoutBtn")
    // Toggle dropdown when clicking avatar
    userAvatar.addEventListener("click", function (e) {
        e.stopPropagation()
        userDropdown.classList.toggle("show")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove("show")
        }
    })

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && userDropdown.classList.contains("show")) {
            userDropdown.classList.remove("show")
        }
    })

    // Handle logout button click
    logoutBtn.addEventListener("click", async function () {
        // Close dropdown first
        userDropdown.classList.remove("show")
        try {
            await httpRequest.post("auth/logout")
        } catch {}
        localStorage.removeItem("accessToken")
        localStorage.removeItem("currentUser")
        location.reload()
    })
})

// Other functionality
document.addEventListener("DOMContentLoaded", async () => {
    const authButtons = $(".auth-buttons")
    const userInfo = $(".user-info")

    try {
        const { user } = await httpRequest.get("users/me")
        authButtons.classList.remove("show")
        userInfo.classList.add("show")
        updateCurrentUser(user)
        loadAllPlaylist()
    } catch (error) {
        authButtons.classList.add("show")
        userInfo.classList.remove("show")
    }

    // Popup Menu Sort Items
    const menuBtn = $("#menuBtn")
    menuBtn.onclick = function (e) {
        const popupMenu = $("#popupMenu")
        popupMenu.classList.toggle("hidden")

        // Handle selecting "Sort by" items
        $$(".menu-item").forEach((item) => {
            item.addEventListener("click", () => {
                let group = item.dataset.group
                document
                    .querySelectorAll(`.menu-item[data-group="${group}"]`)
                    .forEach((i) => {
                        i.querySelector(".checkmark")?.remove()
                    })
                item.insertAdjacentHTML("beforeend", '<span class="checkmark">✔</span>')
            })
        })

        // Handle "View as" buttons
        $$(".view-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                let group = btn.dataset.group
                document
                    .querySelectorAll(`.view-btn[data-group="${group}"]`)
                    .forEach((b) => b.classList.remove("active"))
                btn.classList.add("active")
            })
        })

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!menuBtn.contains(e.target) && !popupMenu.contains(e.target)) {
                popupMenu.classList.add("hidden")
            }
        })
    }

    // View Changes
    const viewBtns = $$(".view-btn")
    viewBtns.forEach((btn) => {
        btn.onclick = (e) => {
            const viewBtn = e.target.closest(".view-btn")
            const libraryContent = $(".library-content")
            switch (viewBtn.dataset.value) {
                case "compact-list":
                    libraryContent.className = ""
                    libraryContent.classList.add("library-content", "compact-list")
                    return
                case "default-list":
                    libraryContent.className = ""
                    libraryContent.classList.add("library-content", "default-list")
                    return
                case "compact-grid":
                    libraryContent.className = ""
                    libraryContent.classList.add("library-content", "compact-grid")
                    return
                case "default-grid":
                    libraryContent.className = ""
                    libraryContent.classList.add("library-content", "default-grid")
                    return
                default:
                    return
            }
        }
    })
    // Active Items
    const libraryItems = $$(".library-item")
    libraryItems.forEach((item) => {
        item.addEventListener("click", function (e) {
            const target = e.target.closest(".library-item")
            libraryItems.forEach((i) => i.classList.remove("active"))
            target.classList.add("active")
        })
    })
    // Slide Show Search Input (scoped to library sidebar)
    const searchContainer = $(".search-library .search-container")
    const searchBtn = $(".search-library .search-btn")
    const searchInput = $(".search-library .search-input")

    searchBtn.addEventListener("click", () => {
        searchContainer.classList.add("active")
        setTimeout(() => searchInput.focus(), 300)
    })

    document.addEventListener("click", (e) => {
        if (!searchContainer.contains(e.target)) {
            searchContainer.classList.remove("active")
            searchInput.blur()
        }
    })
    // Nav Tab
    const navTabs = $$(".nav-tab")
    const libraryContent = $(".library-content")

    const cachedLibraryItems = Array.from(
        libraryContent.querySelectorAll(".library-item")
    ).map((element) => ({
        html: element.outerHTML,
        title:
            element.querySelector(".item-title")?.textContent?.trim()?.toLowerCase() ||
            "",
        subtitle:
            element.querySelector(".item-subtitle")?.textContent?.trim()?.toLowerCase() ||
            "",
    }))

    function renderLibraryByTab(tabValue = "") {
        const key = tabValue.toLowerCase()
        const items = cachedLibraryItems.filter((it) => it.subtitle.includes(key))

        if (!items.length) {
            libraryContent.innerHTML = "<p>No items found</p>"
            return
        }

        libraryContent.replaceChildren(
            ...items.map((it) => {
                const wrapper = document.createElement("div")
                wrapper.innerHTML = it.html
                return wrapper.firstElementChild
            })
        )
    }

    function setActiveTab(tabValue = "") {
        const key = tabValue.toLowerCase()

        navTabs.forEach((btn) => {
            const btnKey = (btn.dataset.tab || "").toLowerCase()
            btn.classList.toggle("active", btnKey === key)
        })

        localStorage.setItem("tabActive", key)
        renderLibraryByTab(key)
    }

    function initTabs() {
        navTabs.forEach((btn) => {
            btn.addEventListener("click", () => {
                const tabType = btn.dataset.tab || ""
                const current = localStorage.getItem("tabActive") || ""
                if (tabType.toLowerCase() !== current.toLowerCase()) {
                    setActiveTab(tabType)
                }
            })
        })

        const initialTab =
            localStorage.getItem("tabActive") ||
            document.querySelector(".nav-tab.active")?.dataset.tab ||
            ""
        if (initialTab) setActiveTab(initialTab)
    }
    initTabs()
    // Search Content
    searchInput.addEventListener("input", (e) => {
        renderLibraryByKeyword(e.target.value)
    })
    function renderLibraryByKeyword(keyword = "") {
        const key = keyword.trim().toLowerCase()

        const items = cachedLibraryItems.filter(
            (it) => it.title.includes(key) || it.subtitle.includes(key)
        )
        if (!items.length) {
            libraryContent.innerHTML = `<p>Coul&apos;dn't find &quot;${keyword}&quot;</p>`
            return
        }
        libraryContent.replaceChildren(
            ...items.map((it) => {
                const wrapper = document.createElement("div")
                wrapper.innerHTML = it.html
                return wrapper.firstElementChild
            })
        )
    }
    // Load All Playlists.
    async function loadAllPlaylist() {
        try {
            const { playlists } = await httpRequest.get("playlists?offset=0&limit=5")
            const { artists } = await httpRequest.get("artists?limit=5&offset=0")

            const list = playlists.filter((item) => item.image_url !== null)
            renderHits(list)
            renderArtists(artists)
        } catch (error) {
            throw new Error(error)
        }
    }
    function renderHits(data) {
        const hitsGrid = document.querySelector(".hits-grid")

        // Nếu không có data thì hiển thị fallback
        if (!data || data.length === 0) {
            hitsGrid.innerHTML = "<p>No playlists found</p>"
            return
        }

        // Map dữ liệu playlist thành danh sách DOM element
        const cards = data.map((item) => {
            if (item.image_url.includes("example")) {
                item.image_url =
                    "https://mynoota.com/_next/image?url=%2F_static%2Fimages%2F__default.png&w=640&q=75"
            }
            const card = document.createElement("div")
            card.className = "hit-card"
            card.dataset.id = item.id
            card.innerHTML = `
      <div class="hit-card-cover">
        <img src="${item.image_url}" alt="${item.name}" />
        <button class="hit-play-btn"><i class="fas fa-play"></i></button>
      </div>
      <div class="hit-card-info">
        <h3 class="hit-card-title">${item.name}</h3>
        <p class="hit-card-artist">
          ${item.user_display_name || item.user_username || "Unknown User"}
        </p>
        <p class="hit-card-meta">
          ${item.total_tracks} tracks · ${formatDuration(item.total_duration)}
        </p>
      </div>
    `
            return card
        })

        // Thay toàn bộ children bằng danh sách card mới
        hitsGrid.replaceChildren(...cards)
    }
    function renderArtists(data) {
        const artistsGrid = document.querySelector(".artists-grid")

        if (!data || data.length === 0) {
            artistsGrid.innerHTML = "<p>No artists found</p>"
            return
        }

        const cards = data.map((item) => {
            const card = document.createElement("div")
            card.className = "artist-card"
            card.dataset.id = item.id
            card.innerHTML = `
        <div class="artist-card-cover">
            <img src="${item.image_url}" alt="${item.name}" />
            <button class="artist-play-btn">
                <i class="fas fa-play"></i>
            </button>
        </div>
        <div class="artist-card-info">
            <h3 class="artist-card-name">${item.name}</h3>
            <p class="artist-card-type">
            ${item.name || "Unknown Artist"}
            </p>
        </div>
        `
            return card
        })

        artistsGrid.replaceChildren(...cards)
    }
    function formatDuration(totalSeconds) {
        if (!totalSeconds) return "0:00"
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = (totalSeconds % 60).toString().padStart(2, "0")
        return `${minutes}:${seconds}`
    }
})

function updateCurrentUser(user) {
    const authButtons = $(".auth-buttons")
    const userInfo = $(".user-info")

    const userName = $("#user-name")
    const userAvatarImg = document.querySelector("#userAvatar img")

    if (user?.avatar_url && userAvatarImg) {
        userAvatarImg.src = user.avatar_url
    }
    if (userName) {
        userName.textContent = user.display_name || user.username || ""
    }
    authButtons.classList.remove("show")
    userInfo.classList.add("show")
}
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}
function isValidPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return regex.test(password)
}
function CheckValidEmail(mail) {
    const emailFormGroup = mail.parentNode
    mail.addEventListener("change", (e) => {
        emailFormGroup.classList.remove("invalid")
        const value = e.target.value
        const valid = isValidEmail(value)

        if (valid) {
            emailFormGroup.classList.remove("invalid")
        } else {
            emailFormGroup.classList.add("invalid")
        }
    })
}
function CheckValidPassword(password) {
    const passwordFormGroup = password.closest(".form-group")

    password.addEventListener("change", (e) => {
        passwordFormGroup.classList.remove("invalid")
        const value = e.target.value
        const valid = isValidPassword(value)
        if (valid) {
            passwordFormGroup.classList.remove("invalid")
        } else {
            passwordFormGroup.classList.add("invalid")
        }
    })
}
// Prevent Context Menu
window.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})

// Toast Message
function showToast({
    title = "Success",
    message = "",
    type = "success",
    duration = 3000,
} = {}) {
    const container = $("#toast-container")
    if (!container) return

    const toast = document.createElement("div")
    toast.className = "toast"
    toast.setAttribute("role", "alert")

    toast.innerHTML = `
        <i class="icon fas fa-check-circle"></i>
        <div class="content">
            <div class="title">${title}</div>
            <div class="message">${message}</div>
        </div>
        <button class="close-btn" aria-label="Close"><i class="fas fa-times"></i></button>
    `

    container.appendChild(toast)

    requestAnimationFrame(() => {
        toast.classList.add("show")
    })

    const remove = () => {
        toast.classList.remove("show")
        setTimeout(() => toast.remove(), 300)
    }

    const timer = setTimeout(remove, duration)

    toast.querySelector(".close-btn").addEventListener("click", () => {
        clearTimeout(timer)
        remove()
    })
}
