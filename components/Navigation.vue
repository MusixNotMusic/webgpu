<template>
    <el-row class="tac">
        <el-col :span="24">
        <h3 class="m-l-4">WebGPU</h3>
            <el-menu default-active="2" class="el-menu-vertical-demo">
                <tepmlate v-for="(menu, index) in navigationList">
                    <!-- node -->
                    <el-sub-menu v-if="menu.children" :index="index">
                        <template #title>
                            <el-icon v-if="menu.icon"></el-icon>
                            <span>{{menu.name}}</span>
                        </template>
                        <el-menu-item v-for="(submenu, sIndex) in menu.children" :index="`${index}-${sIndex}`">
                                <el-icon v-if="submenu.icon"></el-icon>
                                <span><NuxtLink :to="submenu.path">{{submenu.name}}</NuxtLink></span>
                        </el-menu-item>
                    </el-sub-menu>
                    <!-- leaf -->
                    <el-menu-item v-else :index="index">
                        <template #title>
                            <el-icon v-if="menu.icon"></el-icon>
                            <span><NuxtLink :to="menu.path">{{menu.name}}</NuxtLink></span>
                        </template>
                    </el-menu-item>
                </tepmlate>
            </el-menu>
        </el-col>
    </el-row>
</template>
<script>

import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue';

import { ref } from 'vue';
import { navList } from './navigation-config'
export default {
    name: 'Navigation',
    setup() {
        const navigationList = ref(navList);

        return {
            navigationList,
            Location,
            Setting,
            Document,
            IconMenu
        }
    }
}
</script>

<style scoped lang="scss">
.tac {
    width: var(--nav-width);
    height: 100vh;
}
</style>