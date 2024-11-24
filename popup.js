document.addEventListener('DOMContentLoaded', () => {
    // Funkcja usuwająca duplikaty linków
    function removeDuplicates(links) {
        const uniqueLinks = Array.from(new Set(links.map(link => link.url)))
                                  .map(url => links.find(link => link.url === url));
        return uniqueLinks;
    }

    // Funkcja do pobierania linków z bazy danych
    async function fetchLinks(sortBy = 'default') {
        try {
            let url = 'https://getlinks-z7s7pe3uva-uc.a.run.app'; // Adres API do pobierania linków

            if (sortBy !== 'default') {
                url += `?sortBy=${sortBy.field}&sortOrder=${sortBy.order}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const links = await response.json();
            
            // Usuwanie duplikatów przed sortowaniem
            const uniqueLinks = removeDuplicates(links);
            displayLinks(uniqueLinks);
        } catch (error) {
            console.error('Failed to fetch links:', error);
        }
    }

    // Funkcja do wyświetlania linków na stronie
    function displayLinks(links) {
        const linkContainer = document.getElementById('linkContainer');
        linkContainer.innerHTML = ''; // Czyści istniejące linki

        links.forEach(link => {
            const linkElement = document.createElement('div');
            linkElement.innerHTML = ` 
                <span style="color: ${link.status === 'dobry' ? 'green' : 'red'}">
                    ${link.url}
                </span>
                <button class="edit-button" data-id="${link.id}" data-url="${link.url}" data-status="${link.status}">Edit</button>
            `;
            linkContainer.appendChild(linkElement);
        });

        // Dodanie event listenera do przycisków "Edit"
        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => {
            button.addEventListener('click', function () {
                const id = button.getAttribute('data-id');
                const url = button.getAttribute('data-url');
                const status = button.getAttribute('data-status');
                showEditModal(id, url, status);  // Wywołanie funkcji do edytowania linku
            });
        });
    }

    // Wyświetlanie modala do edytowania linku
    function showEditModal(id, url, status) {
        document.getElementById('editUrl').value = url;
        document.getElementById('editStatus').value = status;
        document.getElementById('editModal').style.display = 'block';

        // Przycisk Zapisz
        document.getElementById('saveEdit').addEventListener('click', () => saveEditedLink(id));

        // Przycisk Anuluj
        document.getElementById('cancelEdit').addEventListener('click', () => {
            document.getElementById('editModal').style.display = 'none';
        });
    }

    // Funkcja do zapisania edytowanego linku
    async function saveEditedLink(id) {
        const newUrl = document.getElementById('editUrl').value.trim();
        const newStatus = document.getElementById('editStatus').value;

        const updatedData = { id, url: newUrl, status: newStatus };

        try {
            const response = await fetch('https://editlink-z7s7pe3uva-uc.a.run.app', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert("Link zaktualizowany!");
                fetchLinks(); // Odśwież listę linków po edytowaniu
                document.getElementById('editModal').style.display = 'none';
            } else {
                const errorMessage = await response.text();
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Błąd przy edytowaniu linku:', error);
            alert('Wystąpił błąd podczas edytowania linku.');
        }
    }

    // Obsługuje sprawdzanie linku z uwzględnieniem checkboxa
    document.getElementById('checkLink').addEventListener('click', async () => {
        const url = document.getElementById('checkUrl').value.trim(); // Pobierz wprowadzone URL
        const useModel = document.getElementById('useModel').checked; // Sprawdź stan checkboxa

        if (!url) {
            document.getElementById('checkResult').innerText = 'Proszę podać adres URL.';
            document.getElementById('checkResult').style.display = 'block';
            return;
        }

        // Ustaw komunikat "Ładowanie..." przed rozpoczęciem sprawdzania
        document.getElementById('checkResult').innerText = 'Ładowanie...';
        document.getElementById('checkResult').style.display = 'block';

        const endpoint = useModel
            ? 'https://checklinkwithmodel-z7s7pe3uva-uc.a.run.app'
            : 'https://checklink-z7s7pe3uva-uc.a.run.app/checkLink';

        try {
            let response, data;
            if (useModel) {
                // Obsługuje sprawdzenie za pomocą modelu (POST)
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url })
                });

                if (!response.ok) throw new Error('Błąd połączenia z modelem.');

                data = await response.json();

                // Wyświetlanie statusu zwróconego przez model
                document.getElementById('checkResult').innerText =
                    data.status === 'good'
                        ? 'Link jest poprawny!'
                        : 'Link jest niepoprawny!';
            } else {
                // Obsługuje standardowe API (GET)
                response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`);

                if (response.ok) {
                    data = await response.json();
                    document.getElementById('checkResult').innerText = `Status: ${data.status}`;
                } else {
                    const result = await response.text();
                    document.getElementById('checkResult').innerText =
                        result === 'Link not found!' ? 'Nie ma go w bazie danych.' : result;
                }
            }
        } catch (error) {
            console.error('Błąd:', error);
            document.getElementById('checkResult').innerText = 'Wystąpił błąd: ' + error.message;
        }
    });

    // Obsługuje sortowanie linków
    document.getElementById('sortOptions').addEventListener('change', () => {
        const sortBy = document.getElementById('sortOptions').value;

        let sortParams = {};
        if (sortBy === 'status') {
            sortParams = { field: 'status', order: 'asc' };  // Sortowanie po statusie rosnąco
        } else if (sortBy === 'date') {
            sortParams = { field: 'timestamp', order: 'desc' };  // Sortowanie po dacie malejąco
        }

        fetchLinks(sortParams);  // Pobieranie posortowanych linków
    });

    // Inicjalizacja - pobieranie linków po załadowaniu strony
    fetchLinks();
});
