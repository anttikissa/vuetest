<template>
<div class="full-width center-content">
<h1>Hello world!</h1>
<p>Nam!</p>
<HelloComponent name="Antti" />
</div>
</template>

<script>
import HelloComponent from './components/HelloComponent.vue'
export default {
	components: {
		HelloComponent
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
