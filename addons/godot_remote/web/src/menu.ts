export interface MenuItem {
	title: string
	subtitle: string
}

export interface MenuMenu extends MenuItem {
	items: MenuItem[]
}
