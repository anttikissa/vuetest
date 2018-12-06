<template>
<div class="full-width center-content">
<h1>Hello world!</h1>
<p>Wroom!</p>
<HelloComponent name="Antti" />
<ContextMenu1 />
<ContextMenu2 />
<ContextMenu3 />
<ContextMenu4 />
<ContextMenu5 />
<ContextMenu6 />
<ContextMenu7 />
<ContextMenu8 />
<ContextMenu9 />
</div>
</template>

<script>
import HelloComponent from './components/HelloComponent.vue'
import ContextMenu1 from './components/weight/ContextMenu1.vue'
import ContextMenu2 from './components/weight/ContextMenu2.vue'
import ContextMenu3 from './components/weight/ContextMenu3.vue'
import ContextMenu4 from './components/weight/ContextMenu4.vue'
import ContextMenu5 from './components/weight/ContextMenu5.vue'
import ContextMenu6 from './components/weight/ContextMenu6.vue'
import ContextMenu7 from './components/weight/ContextMenu7.vue'
import ContextMenu8 from './components/weight/ContextMenu8.vue'
import ContextMenu9 from './components/weight/ContextMenu9.vue'

export default {
	components: {
		HelloComponent,
		ContextMenu1,
		ContextMenu2,
		ContextMenu3,
		ContextMenu4,
		ContextMenu5,
		ContextMenu6,
		ContextMenu7,
		ContextMenu8,
		ContextMenu9,
	}
}
</script>

<style lang="stylus" scoped>
.full-width {
	width: 100%
}

.center-content {
	display: flex
	justify-content: center
	align-items: center
}

p {
	color: blue
}
</style>
