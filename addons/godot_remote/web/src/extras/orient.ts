const orient_warn = document.getElementById('orient-warn') as HTMLDivElement


function update() {
	orient_warn.style.visibility = window.innerWidth < window.innerHeight ? 'visible' : 'hidden'
}

window.addEventListener('resize', (ev) => update())
update()
