/**
 * RETO INTEGRACIÓN FINAL: Sistema de Blog Full-Stack
 * 
 * OBJETIVO:
 * Integrar todos los conceptos del curso en un proyecto completo:
 * tipos avanzados, genéricos, clases, async, validación, y patrones.
 * 
 * ARQUITECTURA:
 * 
 * 1. BACKEND (API):
 *    - PostRepository (genérico con cache)
 *    - UserRepository
 *    - CommentRepository
 *    - Validación de datos
 *    - Manejo de errores
 * 
 * 2. FRONTEND (Client):
 *    - ApiClient con retry y circuit breaker
 *    - State management type-safe
 *    - Validación de forms
 * 
 * 3. COMPARTIDO:
 *    - DTOs y tipos compartidos
 *    - Validators compartidos
 *    - Utility types
 * 
 * ENTIDADES:
 * 
 * - User: id, email, name, role, createdAt
 * - Post: id, authorId, title, content, tags, status, createdAt
 * - Comment: id, postId, authorId, content, createdAt
 * 
 * FUNCIONALIDADES:
 * 
 * 1. Autenticación:
 *    - Login/Logout
 *    - JWT tokens
 *    - Role-based access
 * 
 * 2. Posts:
 *    - CRUD completo
 *    - Paginación
 *    - Búsqueda y filtros
 *    - Draft/Published status
 * 
 * 3. Comentarios:
 *    - Crear/editar/eliminar
 *    - Nested comments (opcional)
 *    - Moderación
 * 
 * 4. Features avanzadas:
 *    - Real-time updates (opcional)
 *    - Image upload
 *    - Markdown support
 *    - SEO metadata
 * 
 * PATRONES A USAR:
 * - Repository Pattern
 * - Strategy Pattern (validación)
 * - Observer Pattern (eventos)
 * - Factory Pattern (DTOs)
 * - Singleton (connections)
 * 
 * EJEMPLO DE USO:
 * 
 * // Backend
 * const postService = new PostService();
 * const posts = await postService.getPublishedPosts({ page: 1, limit: 10 });
 * 
 * // Frontend
 * const client = new BlogApiClient();
 * const posts = await client.posts.list({ page: 1 });
 * 
 * CRITERIOS DE EVALUACIÓN:
 * - ✅ Type safety completo
 * - ✅ Manejo robusto de errores
 * - ✅ Validación comprehensiva
 * - ✅ Código reutilizable y mantenible
 * - ✅ Tests completos
 */

// ============================================
// TIPOS COMPARTIDOS
// ============================================

type UserRole = "admin" | "author" | "reader";
type PostStatus = "draft" | "published" | "archived";

interface Entity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface User extends Entity {
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  avatar?: string;
}

interface Post extends Entity {
  authorId: string;
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  status: PostStatus;
  publishedAt?: Date;
  viewCount?: number;
}

interface Comment extends Entity {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string; // Para comentarios anidados
}

// ============================================
// TU CÓDIGO AQUÍ
// ============================================

// TODO: Implementar:
// 1. Repositories con genéricos
// 2. Services con lógica de negocio
// 3. API Client
// 4. Validadores
// 5. DTOs y mappers
// 6. Error handling

// ============================================
// TESTS (NO MODIFICAR)
// ============================================

async function runTests(): Promise<void> {
  console.log("=== INTEGRATION TESTS ===\n");

  // Test 1: Create user
  const userService = new UserService();
  const user = await userService.create({
    email: "test@example.com",
    name: "Test User",
    role: "author",
  });
  console.assert(user.id !== undefined, "❌ Test 1 failed");
  console.log("✅ Test 1 passed: Create user");

  // Test 2: Create post
  const postService = new PostService();
  const post = await postService.create({
    authorId: user.id,
    title: "Test Post",
    content: "This is a test post",
    tags: ["test"],
    status: "draft",
  });
  console.assert(post.id !== undefined, "❌ Test 2 failed");
  console.log("✅ Test 2 passed: Create post");

  // Test 3: Publish post
  const published = await postService.publish(post.id);
  console.assert(published.status === "published", "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Publish post");

  // Test 4: Add comment
  const commentService = new CommentService();
  const comment = await commentService.create({
    postId: post.id,
    authorId: user.id,
    content: "Great post!",
  });
  console.assert(comment.id !== undefined, "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Add comment");

  // Test 5: Get post with comments
  const postWithComments = await postService.getWithComments(post.id);
  console.assert(postWithComments.comments.length === 1, "❌ Test 5 failed");
  console.log("✅ Test 5 passed: Get post with comments");

  console.log("\n🎉 All integration tests passed!");
}

// Descomentar para ejecutar tests
// runTests();
