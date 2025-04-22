<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Boards</h2>
    <ul>
      <li v-for="board in boards" :key="board.id" class="mb-2">
        {{ board.name }}
      </li>
    </ul>
    <button @click="addNewBoard" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
      Add New Board
    </button>
  </div>
</template>

<script setup lang="ts"></script>
