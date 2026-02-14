const API_BASE = window.location.origin

const state = {
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    activeTab: 'services',
    selectedServiceId: null,
    catalog: {
        services: { endpoint: '/services', loaded: false, items: [], filtered: [] },
        professionals: { endpoint: '/professionals', loaded: false, items: [], filtered: [] },
        products: { endpoint: '/products', loaded: false, items: [], filtered: [] },
        packages: { endpoint: '/packages', loaded: false, items: [], filtered: [] }
    }
}

function showToast(message) {
    const toast = document.getElementById('toast')
    toast.textContent = message
    toast.classList.add('show')
    setTimeout(() => toast.classList.remove('show'), 2300)
}

function setAuthStatus() {
    const authStatus = document.getElementById('authStatus')
    authStatus.textContent = state.user
        ? `Logado: ${state.user.name} (${state.user.role})`
        : 'Nao autenticado'
}

function setAuthButtons() {
    document.getElementById('openAuthBtn').classList.toggle('hidden', !!state.user)
    document.getElementById('logoutBtn').classList.toggle('hidden', !state.user)
}

function canOperate() {
    return ['admin', 'barber'].includes(state.user?.role)
}

function syncOpsFormByTab() {
    const blocks = ['services', 'professionals', 'products', 'packages']
    const enabled = canOperate()

    blocks.forEach((tab) => {
        const element = document.getElementById(`opsForm-${tab}`)
        if (!element) return
        const show = enabled && state.activeTab === tab
        element.classList.toggle('hidden', !show)
    })
}

async function api(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    }

    if (state.token) headers.Authorization = `Bearer ${state.token}`

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
        const error = new Error(data?.message || `Erro HTTP ${response.status}`)
        error.status = response.status
        throw error
    }

    return data
}

async function checkHealth() {
    try {
        await api('/health')
        document.getElementById('serverStatus').textContent = 'API online'
    } catch (_error) {
        document.getElementById('serverStatus').textContent = 'API offline'
    }
}

function activateTab(tab) {
    state.activeTab = tab

    document.querySelectorAll('#catalogTabs .menu-item').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === tab)
    })

    document.querySelectorAll('.tab-content').forEach((section) => {
        section.classList.toggle('active', section.id === `tab-${tab}`)
    })

    syncOpsFormByTab()
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden')
}

function openAuthModal() {
    document.getElementById('authModal').classList.remove('hidden')
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden')
    state.selectedServiceId = null
    document.getElementById('bookingForm').reset()
}

function openBookingModal(service) {
    if (!state.user) {
        showToast('Faca login para agendar')
        openAuthModal()
        return
    }

    state.selectedServiceId = service.id
    document.getElementById('bookingServiceName').textContent =
        `${service.name} - R$ ${Number(service.price || 0).toFixed(2)} - ${service.duration} min`
    document.getElementById('bookingModal').classList.remove('hidden')
}

function renderServicesList() {
    const list = document.getElementById('servicesList')
    const items = state.catalog.services.filtered

    if (!items.length) {
        list.innerHTML = '<article class="service-item"><p>Nenhum servico encontrado.</p></article>'
        return
    }

    list.innerHTML = items.map((service) => (
        `<article class="service-item">
            <div>
                <h3 class="service-title">${service.name}</h3>
                <div class="service-meta">
                    <span>R$ ${Number(service.price || 0).toFixed(2)}</span>
                    <span>${service.duration} min</span>
                    <span>${service.description || 'Sem descricao'}</span>
                </div>
            </div>
            <button class="btn primary book-btn" data-id="${service.id}">Agendar</button>
        </article>`
    )).join('')

    document.querySelectorAll('.book-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.id)
            const service = state.catalog.services.items.find((item) => item.id === id)
            if (service) openBookingModal(service)
        })
    })
}

function renderProfessionalsList() {
    const list = document.getElementById('professionalsList')
    const items = state.catalog.professionals.filtered

    if (!items.length) {
        list.innerHTML = '<article class="service-item"><p>Nenhum profissional encontrado.</p></article>'
        return
    }

    list.innerHTML = items.map((professional) => (
        `<article class="service-item">
            <div>
                <h3 class="service-title">${professional.name}</h3>
                <div class="service-meta">
                    <span>${professional.specialty}</span>
                    <span>${professional.bio || 'Sem bio'}</span>
                </div>
            </div>
        </article>`
    )).join('')
}

function renderProductsList() {
    const list = document.getElementById('productsList')
    const items = state.catalog.products.filtered

    if (!items.length) {
        list.innerHTML = '<article class="service-item"><p>Nenhum produto encontrado.</p></article>'
        return
    }

    list.innerHTML = items.map((product) => (
        `<article class="service-item">
            <div>
                <h3 class="service-title">${product.name}</h3>
                <div class="service-meta">
                    <span>R$ ${Number(product.price || 0).toFixed(2)}</span>
                    <span>Estoque: ${product.stock ?? 0}</span>
                    <span>${product.description || 'Sem descricao'}</span>
                </div>
            </div>
        </article>`
    )).join('')
}

function renderPackagesList() {
    const list = document.getElementById('packagesList')
    const items = state.catalog.packages.filtered

    if (!items.length) {
        list.innerHTML = '<article class="service-item"><p>Nenhum pacote encontrado.</p></article>'
        return
    }

    list.innerHTML = items.map((item) => (
        `<article class="service-item">
            <div>
                <h3 class="service-title">${item.name}</h3>
                <div class="service-meta">
                    <span>R$ ${Number(item.price || 0).toFixed(2)}</span>
                    <span>${item.duration} min</span>
                    <span>${item.description || 'Sem descricao'}</span>
                </div>
            </div>
        </article>`
    )).join('')
}

function filterCatalog(type, term) {
    const text = term.toLowerCase().trim()
    const baseItems = state.catalog[type].items

    state.catalog[type].filtered = baseItems.filter((item) => {
        if (type === 'services') {
            return String(item.name || '').toLowerCase().includes(text)
                || String(item.description || '').toLowerCase().includes(text)
        }
        if (type === 'professionals') {
            return String(item.name || '').toLowerCase().includes(text)
                || String(item.specialty || '').toLowerCase().includes(text)
                || String(item.bio || '').toLowerCase().includes(text)
        }
        if (type === 'products') {
            return String(item.name || '').toLowerCase().includes(text)
                || String(item.description || '').toLowerCase().includes(text)
        }
        return String(item.name || '').toLowerCase().includes(text)
            || String(item.description || '').toLowerCase().includes(text)
    })

    if (type === 'services') renderServicesList()
    if (type === 'professionals') renderProfessionalsList()
    if (type === 'products') renderProductsList()
    if (type === 'packages') renderPackagesList()
}

async function loadCatalog(type, force = false) {
    const target = state.catalog[type]
    if (target.loaded && !force) return

    try {
        const items = await api(target.endpoint)
        target.items = items
        target.filtered = [...items]
        target.loaded = true

        if (type === 'services') renderServicesList()
        if (type === 'professionals') renderProfessionalsList()
        if (type === 'products') renderProductsList()
        if (type === 'packages') renderPackagesList()
    } catch (error) {
        showToast(error.message)
    }
}

async function switchTab(tab) {
    activateTab(tab)
    await loadCatalog(tab)
}

async function loadAppointments() {
    const section = document.getElementById('myAppointmentsSection')
    if (!state.user) {
        section.classList.add('hidden')
        return
    }

    section.classList.remove('hidden')
    try {
        const appointments = await api('/appointments')
        const list = document.getElementById('appointmentsList')

        if (!appointments.length) {
            list.innerHTML = '<article class="service-item"><p>Nenhum agendamento encontrado.</p></article>'
            return
        }

        list.innerHTML = appointments.map((item) => (
            `<article class="service-item">
                <div>
                    <h3 class="service-title">${item.Service?.name || 'Servico'} - ${item.status}</h3>
                    <div class="service-meta">
                        <span>${new Date(item.date).toLocaleString('pt-BR')}</span>
                        <span>Cliente: ${item.User?.name || '-'}</span>
                    </div>
                </div>
            </article>`
        )).join('')
    } catch (error) {
        showToast(error.message)
    }
}

async function updateAppointmentStatus(id, status) {
    try {
        await api(`/appointments/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        })
        showToast('Agendamento atualizado')
        await Promise.all([loadPendingAppointments(), loadAppointments()])
    } catch (error) {
        showToast(error.message)
    }
}

async function loadPendingAppointments() {
    const section = document.getElementById('opsSection')
    if (!canOperate()) {
        section.classList.add('hidden')
        return
    }

    section.classList.remove('hidden')
    try {
        const appointments = await api('/appointments')
        const pending = appointments.filter((item) => item.status === 'pending')
        const list = document.getElementById('pendingAppointmentsList')

        if (!pending.length) {
            list.innerHTML = '<article class="service-item"><p>Sem agendamentos pendentes.</p></article>'
            return
        }

        list.innerHTML = pending.map((item) => (
            `<article class="service-item">
                <div>
                    <h3 class="service-title">${item.Service?.name || 'Servico'} - pendente</h3>
                    <div class="service-meta">
                        <span>${new Date(item.date).toLocaleString('pt-BR')}</span>
                        <span>Cliente: ${item.User?.name || '-'}</span>
                    </div>
                </div>
                <button class="btn primary confirm-btn" data-id="${item.id}">Confirmar</button>
            </article>`
        )).join('')

        document.querySelectorAll('.confirm-btn').forEach((button) => {
            button.addEventListener('click', () => updateAppointmentStatus(button.dataset.id, 'confirmed'))
        })
    } catch (error) {
        showToast(error.message)
    }
}

async function handleLogin(event) {
    event.preventDefault()
    try {
        const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            })
        })
        state.token = data.token
        state.user = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setAuthStatus()
        setAuthButtons()
        closeAuthModal()
        await Promise.all([loadAppointments(), loadPendingAppointments()])
        showToast('Login realizado')
    } catch (error) {
        showToast(error.message)
    }
}

async function handleRegister(event) {
    event.preventDefault()
    try {
        await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: document.getElementById('registerName').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value
            })
        })
        event.target.reset()
        showToast('Cadastro criado. Faca login.')
    } catch (error) {
        showToast(error.message)
    }
}

async function createCatalogItem(type, payload) {
    const endpointMap = {
        services: '/services',
        professionals: '/professionals',
        products: '/products',
        packages: '/packages'
    }

    await api(endpointMap[type], {
        method: 'POST',
        body: JSON.stringify(payload)
    })

    await loadCatalog(type, true)
}

async function handleCreateService(event) {
    event.preventDefault()
    try {
        await createCatalogItem('services', {
            name: document.getElementById('serviceName').value,
            price: Number(document.getElementById('servicePrice').value),
            duration: Number(document.getElementById('serviceDuration').value),
            description: document.getElementById('serviceDescription').value
        })
        event.target.reset()
        showToast('Servico salvo')
    } catch (error) {
        showToast(error.message)
    }
}

async function handleCreateProfessional(event) {
    event.preventDefault()
    try {
        await createCatalogItem('professionals', {
            name: document.getElementById('professionalName').value,
            specialty: document.getElementById('professionalSpecialty').value,
            avatarUrl: document.getElementById('professionalAvatarUrl').value,
            bio: document.getElementById('professionalBio').value
        })
        event.target.reset()
        showToast('Profissional salvo')
    } catch (error) {
        showToast(error.message)
    }
}

async function handleCreateProduct(event) {
    event.preventDefault()
    try {
        await createCatalogItem('products', {
            name: document.getElementById('productName').value,
            price: Number(document.getElementById('productPrice').value),
            stock: Number(document.getElementById('productStock').value),
            imageUrl: document.getElementById('productImageUrl').value,
            description: document.getElementById('productDescription').value
        })
        event.target.reset()
        showToast('Produto salvo')
    } catch (error) {
        showToast(error.message)
    }
}

async function handleCreatePackage(event) {
    event.preventDefault()
    try {
        await createCatalogItem('packages', {
            name: document.getElementById('packageName').value,
            price: Number(document.getElementById('packagePrice').value),
            duration: Number(document.getElementById('packageDuration').value),
            description: document.getElementById('packageDescription').value
        })
        event.target.reset()
        showToast('Pacote salvo')
    } catch (error) {
        showToast(error.message)
    }
}

async function handleBooking(event) {
    event.preventDefault()
    try {
        if (!state.selectedServiceId) {
            showToast('Selecione um servico')
            return
        }

        await api('/appointments', {
            method: 'POST',
            body: JSON.stringify({
                serviceId: state.selectedServiceId,
                date: new Date(document.getElementById('bookingDateTime').value).toISOString()
            })
        })
        closeBookingModal()
        showToast('Agendamento solicitado (pendente)')
        await Promise.all([loadAppointments(), loadPendingAppointments()])
    } catch (error) {
        if (error.status === 409) {
            showToast('Horario indisponivel. Escolha outro horario.')
            return
        }
        showToast(error.message)
    }
}

function logout() {
    state.token = ''
    state.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuthStatus()
    setAuthButtons()
    syncOpsFormByTab()
    document.getElementById('myAppointmentsSection').classList.add('hidden')
    document.getElementById('opsSection').classList.add('hidden')
    showToast('Sessao encerrada')
}

function bindEvents() {
    document.querySelectorAll('#catalogTabs .menu-item').forEach((button) => {
        button.addEventListener('click', () => switchTab(button.dataset.tab))
    })

    document.getElementById('openAuthBtn').addEventListener('click', openAuthModal)
    document.getElementById('closeAuthBtn').addEventListener('click', closeAuthModal)
    document.getElementById('closeBookingBtn').addEventListener('click', closeBookingModal)
    document.getElementById('logoutBtn').addEventListener('click', logout)
    document.getElementById('loginForm').addEventListener('submit', handleLogin)
    document.getElementById('registerForm').addEventListener('submit', handleRegister)
    document.getElementById('bookingForm').addEventListener('submit', handleBooking)
    document.getElementById('serviceForm').addEventListener('submit', handleCreateService)
    document.getElementById('professionalForm').addEventListener('submit', handleCreateProfessional)
    document.getElementById('productForm').addEventListener('submit', handleCreateProduct)
    document.getElementById('packageForm').addEventListener('submit', handleCreatePackage)

    document.getElementById('refreshServicesBtn').addEventListener('click', () => loadCatalog('services', true))
    document.getElementById('refreshProfessionalsBtn').addEventListener('click', () => loadCatalog('professionals', true))
    document.getElementById('refreshProductsBtn').addEventListener('click', () => loadCatalog('products', true))
    document.getElementById('refreshPackagesBtn').addEventListener('click', () => loadCatalog('packages', true))
    document.getElementById('refreshAppointmentsBtn').addEventListener('click', loadAppointments)

    document.getElementById('serviceSearch').addEventListener('input', (event) => {
        filterCatalog('services', event.target.value)
    })
    document.getElementById('professionalSearch').addEventListener('input', (event) => {
        filterCatalog('professionals', event.target.value)
    })
    document.getElementById('productSearch').addEventListener('input', (event) => {
        filterCatalog('products', event.target.value)
    })
    document.getElementById('packageSearch').addEventListener('input', (event) => {
        filterCatalog('packages', event.target.value)
    })
}

async function bootstrap() {
    bindEvents()
    setAuthStatus()
    setAuthButtons()
    activateTab('services')
    await checkHealth()
    await loadCatalog('services')
    syncOpsFormByTab()

    if (state.user && state.token) {
        await Promise.all([loadAppointments(), loadPendingAppointments()])
    }
}

bootstrap()
