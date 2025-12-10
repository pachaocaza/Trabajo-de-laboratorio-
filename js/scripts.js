const API = "https://skullgirlsmobile.fandom.com/api.php?origin=*";

document.getElementById("searchBtn").addEventListener("click", buscarPersonaje);

document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarPersonaje();
});

async function buscarPersonaje() {
    const nombre = document.getElementById("searchInput").value.trim();
    const result = document.getElementById("result");

    if (!nombre) {
        result.innerHTML = `<p class="text-red-400">Escribe un nombre primero.</p>`;
        return;
    }

    result.innerHTML = `<p class="text-gray-300 animate-pulse">Buscando...</p>`;

    try {
        // 1. Buscar el personaje base
        const res = await fetch(
            `${API}&action=query&list=search&format=json&srsearch=${nombre}`
        );
        const data = await res.json();

        if (!data.query.search.length) {
            result.innerHTML = `<p class="text-red-400">❌ No se encontró ese personaje.</p>`;
            return;
        }

        const personaje = data.query.search[0].title;

        // 2. Obtener variantes
        const res2 = await fetch(
            `${API}&action=query&list=categorymembers&format=json&cmtitle=Category:Variants&cmlimit=500`
        );
        const variantesData = await res2.json();

        const variantes = variantesData.query.categorymembers.filter(v =>
            v.title.toLowerCase().includes(personaje.toLowerCase())
        );

        result.innerHTML = `
            <h2 class="text-2xl text-pink-300 font-bold mb-4">${personaje}</h2>
            <h3 class="text-xl mb-2 text-pink-400">Variantes encontradas:</h3>
            <div id="varList" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        `;

        // 3. Información individual de cada variante
        for (const variante of variantes) {
            const res3 = await fetch(
                `${API}&action=query&prop=pageimages|extracts&format=json&piprop=original&exintro&titles=${variante.title}`
            );

            const d = await res3.json();
            const pageId = Object.keys(d.query.pages)[0];
            const page = d.query.pages[pageId];

            const img = page.original
                ? page.original.source
                : "https://via.placeholder.com/200?text=Sin+imagen";

            const extract = page.extract || "Sin descripción disponible.";

            document.getElementById("varList").innerHTML += `
                <div class="bg-gray-800 p-4 rounded-lg shadow hover:scale-105 transition">
                    <h4 class="font-bold text-yellow-300 mb-2">${variante.title}</h4>
                    <img src="${img}" class="w-40 mx-auto rounded mb-2 shadow">
                    <p class="text-gray-300 text-sm">${extract}</p>
                </div>
            `;
        }

        if (variantes.length === 0) {
            result.innerHTML += `<p class="text-gray-400 mt-4">No hay variantes para este personaje.</p>`;
        }

    } catch (error) {
        console.error(error);
        result.innerHTML = `<p class="text-red-400">⚠ Error consultando la API.</p>`;
    }
}
