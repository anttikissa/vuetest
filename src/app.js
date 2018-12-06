import Vue from 'vue'
import App from './App.vue'

import m1 from './weight/module1'
import m2 from './weight/module2'
import m3 from './weight/module3'
import m4 from './weight/module4'
import m5 from './weight/module5'
import m6 from './weight/module6'
import m7 from './weight/module7'
import m8 from './weight/module8'
import m9 from './weight/module9'

new Vue({
	el: '#app',
	render: h => h(App)
})

class Foo {
	constructor() {
		console.log('Foo constructing!')
	}
}

new Foo()

console.log(m1, m2, m3, m4, m5, m6, m7, m8, m9)
