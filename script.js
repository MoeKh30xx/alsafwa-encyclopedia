const state = {
    people: [],
    filtered: [],
    roles: []
};

function slugify(s) {
    return s.trim().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '');
}

function render() {
    const list = document.getElementById('results');
    list.innerHTML = '';
    state.filtered.forEach(p => {
        // Prepare roles display with separators
        const rolesHtml = (p.roles || []).map(r => String.raw`<span class="badge">${r}</span>`).join(' / ');
        // Build birth and death date string
        let dates = '';
        // Birth date
        if (p.birth_year_hijri || p.birth_year_greg) {
            dates += 'ولد ';
            if (p.birth_year_hijri) {
                dates += p.birth_year_hijri + 'هـ';
            }
            if (p.birth_year_hijri && p.birth_year_greg) {
                dates += ' / ';
            }
            if (p.birth_year_greg) {
                dates += p.birth_year_greg + 'م';
            }
        }
        // Death date
        if (p.death_year_hijri || p.death_year_greg) {
            if (dates) {
                dates += '، ';
            }
            dates += 'توفي ';
            if (p.death_year_hijri) {
                dates += p.death_year_hijri + 'هـ';
            }
            if (p.death_year_hijri && p.death_year_greg) {
                dates += ' / ';
            }
            if (p.death_year_greg) {
                dates += p.death_year_greg + 'م';
            }
        }
        const dateHtml = dates ? String.raw`<div class="muted">${dates}</div>` : '';
        const li = document.createElement('li');
        li.className = 'card';
        li.innerHTML = String.raw`<h3>${p.full_name}</h3><p class="muted">${rolesHtml}</p>${dateHtml}`;
        li.onclick = () => {
            alert([p.full_name, p.bio_summary || '', (p.sources || []).join('\n- ')].filter(Boolean).join('\n\n'));
        };
        list.appendChild(li);
    });
}

function applyFilters() {
    const q = document.getElementById('search').value.trim();
    const sort = document.getElementById('sort').value;
    const role = document.getElementById('role').value;
    let out = state.people.filter(p => !q || p.full_name.includes(q));
    if (role) out = out.filter(p => (p.roles || []).includes(role));
    if (sort === 'name') {
        out.sort((a,b) => a.full_name.localeCompare(b.full_name,'ar'));
    } else {
        out.sort((a,b) => (a.death_year_hijri || 0) - (b.death_year_hijri || 0));
    }
    state.filtered = out;
    render();
}

async function init() {
    const res = await fetch('people.json');
    state.people = await res.json();
    state.roles = [...new Set(state.people.flatMap(p => p.roles || []))];
    const roleSel = document.getElementById('role');
    state.roles.forEach(r => {
        const o = document.createElement('option');
        o.value = r;
        o.textContent = r;
        roleSel.appendChild(o);
    });
    document.getElementById('search').oninput = applyFilters;
    document.getElementById('sort').onchange = applyFilters;
    document.getElementById('role').onchange = applyFilters;
    applyFilters();
}

init();
