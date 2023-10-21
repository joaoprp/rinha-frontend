const CHUNK_SIZE = 256 * 1024;
const init = () => document.getElementById('json').addEventListener('change', processFile);

async function processFile(event) {
    const file = event.target.files[0];
    const sliced = [];

    for (let i = 0; i < file.size; i += CHUNK_SIZE) {
        sliced.push(file.slice(i, i + CHUNK_SIZE));
    }

    const filePromises = sliced.map((f) => {
        return new Promise((resolve, _) => {
            const reader = new FileReader();

            reader.readAsArrayBuffer(f);
            reader.onload = function() {
                const decoder = new TextDecoder('utf-8');
                resolve(decoder.decode(new Uint8Array(this.result)));
            }
        });
    });

    const json = toJSON((await Promise.all(filePromises)).join(''));

    if (!!json) {
        document.getElementById('input').classList.add('hidden');        
        document.getElementById('data').insertAdjacentHTML('beforeend', renderHTML(json));

        document.getElementById('render-area').classList.remove('hidden');
    } else {
        document.getElementById('invalid-file').classList.remove('invisible');
    }
    
    document.getElementById('filename').textContent = file.name;
}

function toJSON(jsonString) {
    try {
        const json = JSON.parse(jsonString);

        if (json && typeof json === 'object') {
            return json;
        }
    } catch(_) { }

    return false;
}

function triggerLoadFile() {
    document.getElementById('json').click();
    document.getElementById('invalid-file').classList.add('invisible');
}

function renderHTML(obj) {
    if (obj && typeof obj === 'object') {
        return Object.entries(obj).map((el) => {
            let content = el[1];
            let lsqb = '';
            let rsqb = '';
            const key = Array.isArray(obj) ? 'index' : 'key';

            if (el[1] && typeof el[1] === 'object') {
                content = renderHTML(el[1]);
                if (el[1].length) {
                    lsqb = '<span class="bracket">[</span>';
                    rsqb = '<span class="bracket">]</span>';
                }
            } else if (typeof el[1] === 'string') {
                content = `"${el[1]}"`
                    .replaceAll('&', '&amp;')
                    .replaceAll('<', '&lt;')
                    .replaceAll('>', '&gt;')
                    .replaceAll('"', '&quot;')
                    .replaceAll("'", '&#039;')
                    .replaceAll("{", '&lcub;')
                    .replaceAll("}", '&rcub;')
                    .replaceAll("[", '&lsqb;')
                    .replaceAll("]", '&rsqb;');
            }

            return `<div class="wrapper"><span class="${key}">${el[0]}: </span>${lsqb} ${content} ${rsqb}</div>`;
        }).join('');
    }
}