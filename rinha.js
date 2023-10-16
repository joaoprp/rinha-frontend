function init() {
    document.getElementById('json').addEventListener('change', processFile);
}

function isJSON(jsonString) {
    try {
        const test = JSON.parse(jsonString);

        if (test && typeof test === 'object') {
            return true;
        }
    } catch(_) { }

    return false;
}

function processContent(evt) {
    const buffer = evt.target.result;
    const chunkSize = 16384;

    const view = new Uint8Array(buffer);
    const decoder = new TextDecoder("utf-8");
    let jsonString = "";
    for (let i = 0; i < view.length; i += chunkSize) {
        const chunk = view.slice(i, i + chunkSize);

        jsonString += decoder.decode(chunk);
    }

    if (isJSON(jsonString)) {
        document.getElementById('input').classList.add('hidden');
        document.getElementById('data').innerHTML = syntaxHighlight(jsonString);
        document.getElementById('render-area').classList.remove('hidden');
    } else {
        document.getElementById('invalid-file').classList.remove('invisible');
    }
}

function processFile(evt) {
    const reader = new FileReader();
    reader.onload = processContent;
    reader.readAsArrayBuffer(evt.target.files[0]);
    document.getElementById('filename').textContent = evt.target.files[0].name;
}

function triggerLoadFile() {
    document.getElementById('json').click();
    document.getElementById('invalid-file').classList.add('invisible');
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/{/g, "<span class='block'>").replace(/}/g, '</span>');
    json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
                match = match.replace(/"/g, '');
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });

    return json.replace(/,</g, "<br /><");
}