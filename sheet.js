window.addEventListener('load', () => {

    const sheet = document.getElementById('sheet')
    const uid_i = document.getElementById('cid')

    var save;

    var saveRequired = false;
    sheet.addEventListener('keyup', () => { saveRequired = true })
    sheet.addEventListener('click', () => { saveRequired = true })

    function getSave(id) {
        const jsonData = localStorage.getItem(`cso_${id}`)
        return JSON.parse(jsonData)
    }

    function fillForm(data) {
        for(const name in data) {
            if (name != "uid") {
                let el = document.getElementsByName(name)
                if (el.length > 0) {
                    if (el[0].getAttribute("type") == "checkbox") {
                        el[0].setAttribute("checked", "checked")
                    } else if (el[0].tagName.toLowerCase() == "textarea") {
                        const lines = data[name].split("\n")
                        el[0].innerHTML = lines.join("\r\n")
                    } else if (el[0].tagName.toLowerCase() == "select") {
                        el[0].childNodes.forEach((v, k, e) => {
                            if (v.nodeName != "#text" && v.getAttribute("value") == data[name]) {
                                v.setAttribute("selected", "selected")
                            }
                        })
                    } else {
                        el[0].setAttribute("value", data[name])
                    }
                }
            }
        }
    }

    function saveForm(save = null) {
        if (save == null) {
            const data = new FormData(sheet)
            const val = Object.fromEntries(data.entries())
            save = JSON.stringify(val)
        }
        const qs = new URLSearchParams(window.location.search)
        const ch = JSON.parse(save)

        for(let i in ch) {
            if (!ch[i] || ch[i].length < 1) {
                delete ch[i]
            }
        }

        if (!ch.uid) {
            ch.uid = Date.now().toString(36)
        }

        if (Object.keys(ch).length <= 1) {
            // just uuid
            console.log("No save, blank sheet.")
            return
        }

        save = JSON.stringify(ch)

        localStorage.setItem(`cso_${ch.uid}`, save)

        var list = localStorage.getItem("cso_char_list") || ""
        list = list.split(",").filter(n => n.length > 0)
        if (list.indexOf(ch.uid) < 0) {
            list.push(ch.uid)
            localStorage.setItem('cso_char_list', list.join(','))
        }

        if (qs.get('cid') != ch.uid) {
            qs.set('cid', ch.uid)
            window.location.search = qs
        }
    }

    
    /** Textarea auto-resize */
    function resizeTextareas() {
        const tas = document.getElementsByTagName("textarea")
        for(let i = 0; i < tas.length; i++) {
            tas[i].setAttribute("style", "height:" + (tas[i].scrollHeight) + "px;overflow-y:hidden;");
            tas[i].style.height = 0
            tas[i].style.height = (tas[i].style.paddingTop + tas[i].style.paddingBottom + tas[i].scrollHeight) + "px"
            tas[i].addEventListener("input", function() {
                this.style.height = 0
                this.style.height = (this.style.paddingTop + this.style.paddingBottom + this.scrollHeight) + "px"
            }, false);
        }
    }

    const qs = new URLSearchParams(window.location.search)
    if (qs.has("cid")) {
        const ch = getSave(qs.get('cid'))
        uid_i.setAttribute('value', qs.get('cid'))
        fillForm(ch)
    } else {
        uid_i.setAttribute('value', Date.now().toString(36))
    }

    setInterval(() => {
        if (!saveRequired) return

        console.log("Saving...")

        saveForm()
        resizeTextareas()

        saveRequired = false
        console.log("Complete.")
    }, 5000)


    window.addEventListener("resize", resizeTextareas)
    resizeTextareas()


    /** Toolbar */
    const penColor = document.getElementById("tool_pen_color")
    penColor.addEventListener('change', (ev) => {
        sheet.classList.remove("pc_blue")
        sheet.classList.remove("pc_green")
        sheet.classList.remove("pc_red")

        if (penColor.value.length > 0) {
            sheet.classList.add(penColor.value)
        }
    })

    const writingFont = document.getElementById("tool_writing_font")
    writingFont.addEventListener('change', (ev) => {
        sheet.classList.remove("wf_mono")
        sheet.classList.remove("wf_serif")
        sheet.classList.remove("wf_sans")

        if (writingFont.value.length > 0) {
            sheet.classList.add(writingFont.value)
        }
    })

    const spellPageToggle = document.getElementById("spell_page_toggle")
    const spellPage = document.getElementById("spells-page")
    spellPageToggle.addEventListener('click', () => {
        if (spellPageToggle.getAttribute('checked') == "checked") {
            spellPageToggle.removeAttribute("checked")
            spellPage.style.display = "none"
        } else {
            spellPageToggle.setAttribute("checked", "checked")
            spellPage.style.display = "block"
        }
    })

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

    const btnImport = document.getElementById("import")
    btnImport.addEventListener("click", (e) => {
        e.preventDefault()
        const data = prompt("Paste contents of export.", "")
        if (data && data.length > 0) {
            saveForm(data)
        }
    })

    const btnExport = document.getElementById("export")
    btnExport.addEventListener("click", (e) => {
        e.preventDefault()
        const data = new FormData(sheet)
        const val = Object.fromEntries(data.entries())

        for(let i in val) {
            if (!val[i] || val[i].length < 1) {
                delete val[i]
            }
        }
        save = JSON.stringify(val)

        const saveData = encodeURIComponent(save)
        const uri = `data:text/json;charset=utf-i,${saveData}`
        const anch = document.createElement('a')
        anch.setAttribute("href", uri)
        anch.setAttribute("download", "Character Sheet Online - " + val.character_name + "(" + val.uid + ").json")
        document.body.appendChild(anch)
        anch.click()
        anch.remove()
    })

    const btnDelete = document.getElementById("btnDelete")
    btnDelete.addEventListener('click', (e) => {
        e.preventDefault()

        localStorage.removeItem(`cso_${uid_i.getAttribute('value')}`)
        window.location.search = ''
    })






    
    /** Print Views */
    var inputList = Array.from(sheet.getElementsByTagName("input"))
    inputList = inputList.concat(Array.from(sheet.getElementsByTagName("select")))
    inputList = inputList.concat(Array.from(sheet.getElementsByTagName("textarea")))
    
    for (let i in inputList) {
        if (inputList[i].type == 'checkbox')
            continue

        const pv = document.createElement('div')
        pv.className = 'printview'
        inputList[i].after(pv)
        pv.innerHTML = inputList[i].value.replace(/\r?\n/ig, "<br />")
        inputList[i].addEventListener('keyup', (e) => {
            pv.innerHTML = inputList[i].value.replace(/\r?\n/ig, "<br />")
        })
        inputList[i].addEventListener('click', (e) => {
            pv.innerHTML = inputList[i].value.replace(/\r?\n/ig, "<br />")
        })
    }

})