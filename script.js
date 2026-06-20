let allPosts = []; // En tom variabel som väntar på datan
let introTexts = {};

// 1. Hämta datan EN GÅNG när sidan laddas
Promise.all([
    fetch('jsons/posts.json').then(r => r.json()),
    fetch('jsons/introtexts.json').then(r => r.json())
])
.then(([postsData, introData]) => {

    allPosts = postsData;
    introTexts = introData;
        
        // Läs av om det finns en parameter som heter "cat" i adressen
        const hash = window.location.hash.substring(1);

if (hash) {
    filterCategory(
        hash.charAt(0).toUpperCase() + hash.slice(1)
    );
} else {
    filterCategory('Home');
}
    });

window.addEventListener('hashchange', () => {

    const hash = window.location.hash.substring(1);

    if (hash) {
        filterCategory(
            hash.charAt(0).toUpperCase() + hash.slice(1)
        );
    } else {
        filterCategory('Home');
    }
});


// OCH SEDAN ↓↓↓

function navigateTo(categoryName) {
    window.location.hash = categoryName.toLowerCase();
}
// 2. Funktionen som körs varje gång du klickar på en knapp
function filterCategory(categoryName) {

   window.location.hash = categoryName.toLowerCase();
    
    const introBox = document.querySelector('.hero-intro');
    // 1. Hitta din textruta och uppdatera den  vvv
    const introParagraph = document.querySelector('.hero-intro p');

    // TEMPORÄR (EGENTLIGEN FÖR ATT FÅ STATUS ATT FUNGERA)
      if (categoryName === 'Status') {
    introBox.style.display = '';
    if (introTexts['Status']) {
        introParagraph.textContent = introTexts['Status'];
    }
    const tocContainer = document.querySelector('.toc');
    tocContainer.classList.add('toc--full');
    fetch('status.html')
        .then(response => response.text())
        .then(html => {
            tocContainer.innerHTML = html;
            renderEntries();
        });
    return;
}
     introBox.style.display = '';
     document.querySelector('.toc').classList.remove('toc--full');
    // Kollar om kategorin finns i lexikonet, och byter i så fall ut texten
    if (introTexts[categoryName]) {
        introParagraph.textContent = introTexts[categoryName];
    }

    const tocContainer = document.querySelector('.toc');
    tocContainer.innerHTML = ''; 

    
    const tocHeader = document.createElement('p');
    tocHeader.className = 'toc-year';
    
    let displayPosts = [];
    let hasMore = false; // Håller koll på om vi ska visa "..." i slutet

    if (categoryName === 'Home') {
        tocHeader.textContent = 'Latest';
        tocContainer.appendChild(tocHeader);
        
        // Sortera inläggen med nyaste datumet först
        const sortedPosts = [...allPosts].sort((a, b) => b.date.localeCompare(a.date));
        
        // Klipp ut de 5 första
        displayPosts = sortedPosts.slice(0, 5);
        
        // Om det finns fler än 5 inlägg totalt, sätt hasMore till true
        if (sortedPosts.length > 5) {
            hasMore = true;
        }
    } else {
        // För de andra knapparna: Sätt rätt rubrik och filtrera på kategori
        tocHeader.textContent = categoryName;
        tocContainer.appendChild(tocHeader);
        displayPosts = allPosts.filter(post => post.category === categoryName);
    }

    // Loopa och rita ut trädstrukturen
    displayPosts.forEach((post, index) => {
        const isLastOfVisible = index === displayPosts.length - 1;
        const useEndBranch = isLastOfVisible && !hasMore;
        const treeBranch = useEndBranch ? '└──' : '├──';
        
        // Här börjar den nya koden du lägger in:
        const lineText = `
            <span class="toc-branch">${treeBranch}</span>
            <a href="post.html?file=${post.file}">${post.title}</a>
            <span class="toc-dots"></span>
            <span class="toc-date">[${post.date}]</span>
        `;

        const p = document.createElement('p');
        p.className = 'toc-text'; // Den nya klassen för CSS
        p.innerHTML = lineText;
        tocContainer.appendChild(p);
    });

    // Om vi är på Home och det finns fler inlägg, skjut in tre punkter sist
    if (hasMore) {
        const dots = document.createElement('p');
        dots.textContent = '└── ...';
        tocContainer.appendChild(dots);
    }
}
// Bygger en TOC-liknande trädlista i valfri container utifrån en lista av {title, date, file}
function buildTreeList(container, items, headerText) {
    container.innerHTML = '';

    const header = document.createElement('p');
    header.className = 'toc-year';
    header.textContent = headerText;
    container.appendChild(header);

    if (!items || items.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'toc-text';
        empty.textContent = 'Nothing here yet.';
        container.appendChild(empty);
        return;
    }

    items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const treeBranch = isLast ? '└──' : '├──';

        const lineText = `
            <span class="toc-branch">${treeBranch}</span>
            <a href="post.html?file=${item.file}">${item.title}</a>
            <span class="toc-dots"></span>
            <span class="toc-date">[${item.date}]</span>
        `;

        const p = document.createElement('p');
        p.className = 'toc-text';
        p.innerHTML = lineText;
        container.appendChild(p);
    });
}

// Hämtar entries.json och ritar ut listan i .entry-toc (på Status-sidan)
function renderEntries() {
    const entryContainer = document.querySelector('.entry-toc');
    if (!entryContainer) return;

    fetch('jsons/entries.json')
        .then(response => response.json())
        .then(entries => {
            // Nyaste först
            const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
            buildTreeList(entryContainer, sortedEntries, 'Entries');
        })
        .catch(() => {
            entryContainer.innerHTML = '<p class="toc-text">Could not load entries.</p>';
        });
}

