<template>
    <div class="nav-container">
        <h2>WebGPU</h2>
        <div class="nav-wrap">
            <div class="nav-box">
                <!-- <div class="nav-item" v-for="(nav, index) in navigationList" :index="index">
                    <span class="m-l-4"><NuxtLink :to="nav.path">{{nav.name}}</NuxtLink></span>
                </div> -->
                <template v-for="(nav, index) in navigationList">
                    <NuxtLink :to="nav.path">
                        <div class="nav-item" :class="{active: index === activeIndex}" :index="index" @click="activeClickHandle(index)">
                            <span class="m-l-2">{{nav.name}}</span>
                        </div>
                    </NuxtLink>
                </template>
            </div>
        </div>
        <div class="github"><a href="https://github.com/MusixNotMusic/webgpu">@Github</a></div>
    </div>
</template>
<script>

import { ref, onMounted } from 'vue';
import { navList } from './navigation-config';
import { useRoute } from 'vue-router';

export default {
    name: 'Navigation',
    setup() {
        const route = useRoute();

        const navigationList = ref(navList);
        const activeIndex = ref(-1);

        const setActiveIndex = () => {
            const index = navigationList.value.findIndex(item => item.path === route.path); 
            if (index >= 0) activeIndex.value = index;
        }

        const activeClickHandle = (index) => {
            if (index !== activeIndex.value) {
                activeIndex.value = index;
            }
        }

        onMounted(() => {
            setActiveIndex();
        });

        return {
            navigationList,
            activeClickHandle,
            activeIndex,
        }
    }
}
</script>

<style scoped lang="scss">

.nav-container {
    width: var(--nav-width);
    background: #fafafa;
    padding: 0 20px;
    h2 {
        margin: 0px;
        height: 60px;
        line-height: 60px;
        font-size: 28px;
        color: #0a63a9;
    }
    .nav-wrap {
        height: calc(100vh - 120px);
        overflow-y: auto;
        border-top: 1px solid #aaa;
        border-bottom: 1px solid #aaa;
        .nav-box {
            .nav-item {
                height: 32px;
                line-height: 32px;
                font-size: 16px;
                border-left: 4px solid transparent;
            }
            .nav-item:hover {
                border-left: 4px solid #03a9f4;
                background: rgba(216,216,216,0.8);
            }
            .active {
                border-left: 4px solid #03a9f4 !important;
                background: rgba(216,216,216,0.8)!important;
            }
        }
    }
}

.github {
    height: 60px;
    font-size: 14px;
    display:flex;
    align-items: center;
}

a:link, a:visited {
    color: #0a63a9;
}
</style>