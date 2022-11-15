window.addEventListener('load', () => {

    const sheet = document.getElementById('sheet')
    const uid_i = document.getElementById('cid')

    var save;

    var saveRequired = false;
    sheet.addEventListener('keyup', () => { saveRequired = true })
    sheet.addEventListener('click', () => { saveRequired = true })

    const qs = new URLSearchParams(window.location.search)
    if (qs.has("cid")) {
        const data = localStorage.getItem(`cso_${qs.get('cid')}`)
        const ch = JSON.parse(data)
        uid_i.setAttribute('value', qs.get('cid'))
        for(const name in ch) {
            if (name != "uid") {
                let el = document.getElementsByName(name)
                if (el.length > 0) {
                    if (el[0].getAttribute("type") == "checkbox") {
                        el[0].setAttribute("checked", "checked")
                    } else {
                        el[0].setAttribute("value", ch[name])
                    }
                }
            }
        }
    } else {
        uid_i.setAttribute('value', Date.now().toString(36))
    }

    setInterval(() => {
        if (!saveRequired) return

        console.log("Saving...")
        const data = new FormData(sheet)
        const val = Object.fromEntries(data.entries())
        
        save = JSON.stringify(val)

        localStorage.setItem(`cso_${val.uid}`, save)
        if (!qs.has('cid')) {
            qs.set('cid', val.uid)
            window.location.search = qs
        }

        saveRequired = false
        console.log("Complete.")
    }, 5000)



    const penColor = document.getElementById("tool_pen_color")
    const writingFont = document.getElementById("tool_writing_font")

    penColor.addEventListener('change', (ev) => {
        sheet.classList.remove("pc_blue")
        sheet.classList.remove("pc_green")
        sheet.classList.remove("pc_red")

        if (penColor.value.length > 0) {
            sheet.classList.add(penColor.value)
        }
    })
    writingFont.addEventListener('change', (ev) => {
        sheet.classList.remove("wf_mono")
        sheet.classList.remove("wf_serif")
        sheet.classList.remove("wf_sans")

        if (writingFont.value.length > 0) {
            sheet.classList.add(writingFont.value)
        }
    })

})