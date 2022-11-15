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
                    } else if (el[0].tagName.toLowerCase() == "textarea") {
                        const lines = ch[name].split("\n")
                        el[0].innerHTML = lines.join("\r\n")
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

        var list = localStorage.getItem("cso_char_list") || ""
        list = list.split(",").filter(n => n.length > 0)
        if (list.indexOf(val.uid) < 0) {
            list.push(val.uid)
            localStorage.setItem('cso_char_list', list.join(','))
        }

        saveRequired = false
        console.log("Complete.")
    }, 5000)



    const penColor = document.getElementById("tool_pen_color")
    const writingFont = document.getElementById("tool_writing_font")
    const spellPageToggle = document.getElementById("spell_page_toggle")
    const spellPage = document.getElementById("spells-page")

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

    spellPageToggle.addEventListener('click', () => {
        if (spellPageToggle.getAttribute('checked') == "checked") {
            spellPageToggle.removeAttribute("checked")
            spellPage.style.display = "none"
        } else {
            spellPageToggle.setAttribute("checked", "checked")
            spellPage.style.display = "block"
        }
    })

    const tas = document.getElementsByTagName("textarea")
    for(let i = 0; i < tas.length; i++) {
        tas[i].setAttribute("style", "height:" + (tas[i].scrollHeight) + "px;overflow-y:hidden;");
        tas[i].style.height = 0
        tas[i].style.height = tas[i].scrollHeight + "px"
        tas[i].addEventListener("input", function() {
            this.style.height = 0
            this.style.height = this.scrollHeight + "px"
        }, false);
    }


    const charList = document.getElementById("char_list")
    var list = localStorage.getItem("cso_char_list") || ""
    list = list.split(",").filter(n => n.length > 0)
    for(let i = 0; i < list.length; i++) {
        const char = localStorage.getItem(`cso_${list[i]}`)
        if (char) {
            const jch = JSON.parse(char)
            var selected = ""
            if (qs.has("cid") && qs.get("cid") == list[i]) {
                selected = " selected"
            }
            charList.innerHTML += `<option value="${list[i]}" ${selected}>${jch['character_name'] || 'Unnamed Character'}</option>`
        }
    }
    charList.addEventListener('change', () => {
        if (charList.value) {
            window.location = "/?cid=" + charList.value
        } else {
            window.location = "/"
        }
    })

})