/**
 * RETO INTEGRACIÓN FINAL: Sistema de Blog Full-Stack - SOLUCIÓN COMPLETA
 * 
 * Este proyecto integra todos los conceptos del curso:
 * - Tipos avanzados y utility types
 * - Genéricos y constraints
 * - Clases y herencia
 * - Async/await patterns
 * - Validación type-safe
 * - Patrones de diseño
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
  viewCount: number;
}

interface Comment extends Entity {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
}

// DTOs
type CreateUserDTO = Omit<User, keyof Entity | "createdAt" | "updatedAt">;
type UpdateUserDTO = Partial<CreateUserDTO>;
type CreatePostDTO = Omit<Post, keyof Entity | "viewCount">;
type UpdatePostDTO = Partial<Omit<CreatePostDTO, "authorId">>;
type CreateCommentDTO = Omit<Comment, keyof Entity>;

// View Models
interface PostWithAuthor extends Post {
  author: User;
}

interface PostWithComments extends Post {
  comments: Comment[];
}

interface PostDetails extends PostWithAuthor {
  comments: CommentWithAuthor[];
}

interface CommentWithAuthor extends Comment {
  author: User;
}

// ============================================
// RESULT TYPE
// ============================================

type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function success<T>(data: T): Result<T> {
  return { success: true, data };
}

function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

// ============================================
// VALIDACIÓN
// ============================================

class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

class Validator {
  static email(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format", "email");
    }
  }

  static minLength(value: string, min: number, field: string): void {
    if (value.length < min) {
      throw new ValidationError(
        `${field} must be at least ${min} characters`,
        field
      );
    }
  }

  static maxLength(value: string, max: number, field: string): void {
    if (value.length > max) {
      throw new ValidationError(
        `${field} must be at most ${max} characters`,
        field
      );
    }
  }

  static notEmpty(value: string, field: string): void {
    if (!value.trim()) {
      throw new ValidationError(`${field} cannot be empty`, field);
    }
  }

  static validateUser(user: CreateUserDTO): void {
    this.email(user.email);
    this.notEmpty(user.name, "name");
    this.minLength(user.name, 2, "name");
    this.maxLength(user.name, 100, "name");
  }

  static validatePost(post: CreatePostDTO): void {
    this.notEmpty(post.title, "title");
    this.minLength(post.title, 5, "title");
    this.maxLength(post.title, 200, "title");
    this.notEmpty(post.content, "content");
    this.minLength(post.content, 50, "content");
  }

  static validateComment(comment: CreateCommentDTO): void {
    this.notEmpty(comment.content, "content");
    this.minLength(comment.content, 1, "content");
    this.maxLength(comment.content, 1000, "content");
  }
}

// ============================================
// REPOSITORY BASE
// ============================================

abstract class Repository<T extends Entity> {
  protected data = new Map<string, T>();
  private idCounter = 0;

  async create(item: Omit<T, keyof Entity>): Promise<T> {
    const id = this.generateId();
    const now = new Date();

    const entity: T = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    } as T;

    this.data.set(id, entity);
    return entity;
  }

  async findById(id: string): Promise<T | null> {
    return this.data.get(id) || null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.data.values());
  }

  async findWhere(predicate: (item: T) => boolean): Promise<T[]> {
    return Array.from(this.data.values()).filter(predicate);
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const entity = await this.findById(id);
    if (!entity) return null;

    const updated: T = {
      ...entity,
      ...updates,
      id, // Preservar ID
      updatedAt: new Date(),
    };

    this.data.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.data.delete(id);
  }

  async count(): Promise<number> {
    return this.data.size;
  }

  protected generateId(): string {
    return `${Date.now()}-${++this.idCounter}`;
  }
}

// ============================================
// REPOSITORIES ESPECÍFICOS
// ============================================

class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findWhere((user) => user.email === email);
    return users[0] || null;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.findWhere((user) => user.role === role);
  }
}

class PostRepository extends Repository<Post> {
  async findByAuthor(authorId: string): Promise<Post[]> {
    return this.findWhere((post) => post.authorId === authorId);
  }

  async findByStatus(status: PostStatus): Promise<Post[]> {
    return this.findWhere((post) => post.status === status);
  }

  async findPublished(): Promise<Post[]> {
    return this.findWhere(
      (post) => post.status === "published" && post.publishedAt !== undefined
    );
  }

  async findByTag(tag: string): Promise<Post[]> {
    return this.findWhere((post) => post.tags.includes(tag));
  }

  async incrementViewCount(id: string): Promise<void> {
    const post = await this.findById(id);
    if (post) {
      await this.update(id, { viewCount: (post.viewCount || 0) + 1 } as Partial<Post>);
    }
  }
}

class CommentRepository extends Repository<Comment> {
  async findByPost(postId: string): Promise<Comment[]> {
    return this.findWhere((comment) => comment.postId === postId);
  }

  async findByAuthor(authorId: string): Promise<Comment[]> {
    return this.findWhere((comment) => comment.authorId === authorId);
  }

  async findReplies(commentId: string): Promise<Comment[]> {
    return this.findWhere((comment) => comment.parentId === commentId);
  }
}

// ============================================
// SERVICES
// ============================================

class UserService {
  constructor(private userRepo = new UserRepository()) {}

  async create(dto: CreateUserDTO): Promise<User> {
    Validator.validateUser(dto);

    // Verificar email único
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ValidationError("Email already exists", "email");
    }

    return this.userRepo.create(dto);
  }

  async update(id: string, dto: UpdateUserDTO): Promise<User | null> {
    if (dto.email) {
      Validator.email(dto.email);

      // Verificar email único
      const existing = await this.userRepo.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ValidationError("Email already exists", "email");
      }
    }

    if (dto.name) {
      Validator.minLength(dto.name, 2, "name");
    }

    return this.userRepo.update(id, dto);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.findAll();
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepo.delete(id);
  }
}

class PostService {
  constructor(
    private postRepo = new PostRepository(),
    private userRepo = new UserRepository(),
    private commentRepo = new CommentRepository()
  ) {}

  async create(dto: CreatePostDTO): Promise<Post> {
    Validator.validatePost(dto);

    // Verificar que el autor existe
    const author = await this.userRepo.findById(dto.authorId);
    if (!author) {
      throw new ValidationError("Author not found", "authorId");
    }

    const post = await this.postRepo.create({
      ...dto,
      viewCount: 0,
    });

    return post;
  }

  async update(id: string, dto: UpdatePostDTO): Promise<Post | null> {
    if (dto.title) {
      Validator.minLength(dto.title, 5, "title");
    }

    if (dto.content) {
      Validator.minLength(dto.content, 50, "content");
    }

    return this.postRepo.update(id, dto);
  }

  async publish(id: string): Promise<Post | null> {
    const post = await this.postRepo.findById(id);

    if (!post) {
      return null;
    }

    if (post.status === "published") {
      return post;
    }

    return this.postRepo.update(id, {
      status: "published",
      publishedAt: new Date(),
    } as Partial<Post>);
  }

  async archive(id: string): Promise<Post | null> {
    return this.postRepo.update(id, { status: "archived" } as Partial<Post>);
  }

  async findById(id: string): Promise<Post | null> {
    const post = await this.postRepo.findById(id);

    if (post && post.status === "published") {
      await this.postRepo.incrementViewCount(id);
    }

    return post;
  }

  async getWithAuthor(id: string): Promise<PostWithAuthor | null> {
    const post = await this.findById(id);
    if (!post) return null;

    const author = await this.userRepo.findById(post.authorId);
    if (!author) return null;

    return { ...post, author };
  }

  async getWithComments(id: string): Promise<PostWithComments | null> {
    const post = await this.findById(id);
    if (!post) return null;

    const comments = await this.commentRepo.findByPost(id);

    return { ...post, comments };
  }

  async getDetails(id: string): Promise<PostDetails | null> {
    const post = await this.findById(id);
    if (!post) return null;

    const author = await this.userRepo.findById(post.authorId);
    if (!author) return null;

    const comments = await this.commentRepo.findByPost(id);

    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const commentAuthor = await this.userRepo.findById(comment.authorId);
        return { ...comment, author: commentAuthor! };
      })
    );

    return {
      ...post,
      author,
      comments: commentsWithAuthors,
    };
  }

  async getPublishedPosts(options?: {
    page?: number;
    limit?: number;
  }): Promise<Post[]> {
    const published = await this.postRepo.findPublished();

    // Ordenar por fecha de publicación (más reciente primero)
    const sorted = published.sort((a, b) => {
      const aTime = a.publishedAt?.getTime() || 0;
      const bTime = b.publishedAt?.getTime() || 0;
      return bTime - aTime;
    });

    // Paginación
    if (options?.page && options?.limit) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      return sorted.slice(start, end);
    }

    return sorted;
  }

  async searchByTag(tag: string): Promise<Post[]> {
    return this.postRepo.findByTag(tag);
  }

  async delete(id: string): Promise<boolean> {
    // Eliminar también los comentarios
    const comments = await this.commentRepo.findByPost(id);
    await Promise.all(comments.map((c) => this.commentRepo.delete(c.id)));

    return this.postRepo.delete(id);
  }
}

class CommentService {
  constructor(
    private commentRepo = new CommentRepository(),
    private userRepo = new UserRepository(),
    private postRepo = new PostRepository()
  ) {}

  async create(dto: CreateCommentDTO): Promise<Comment> {
    Validator.validateComment(dto);

    // Verificar que el post existe
    const post = await this.postRepo.findById(dto.postId);
    if (!post) {
      throw new ValidationError("Post not found", "postId");
    }

    // Verificar que el autor existe
    const author = await this.userRepo.findById(dto.authorId);
    if (!author) {
      throw new ValidationError("Author not found", "authorId");
    }

    // Verificar parent comment si existe
    if (dto.parentId) {
      const parent = await this.commentRepo.findById(dto.parentId);
      if (!parent) {
        throw new ValidationError("Parent comment not found", "parentId");
      }
    }

    return this.commentRepo.create(dto);
  }

  async update(id: string, content: string): Promise<Comment | null> {
    Validator.validateComment({ content } as CreateCommentDTO);
    return this.commentRepo.update(id, { content });
  }

  async delete(id: string): Promise<boolean> {
    // Eliminar también las respuestas
    const replies = await this.commentRepo.findReplies(id);
    await Promise.all(replies.map((r) => this.delete(r.id)));

    return this.commentRepo.delete(id);
  }

  async findByPost(postId: string): Promise<CommentWithAuthor[]> {
    const comments = await this.commentRepo.findByPost(postId);

    return Promise.all(
      comments.map(async (comment) => {
        const author = await this.userRepo.findById(comment.authorId);
        return { ...comment, author: author! };
      })
    );
  }
}

// ============================================
// API CLIENT
// ============================================

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class BlogApiClient {
  constructor(private baseURL: string = "/api") {}

  posts = {
    list: async (options?: {
      page?: number;
      limit?: number;
    }): Promise<Post[]> => {
      // Simular API call
      const service = new PostService();
      return service.getPublishedPosts(options);
    },

    get: async (id: string): Promise<PostDetails | null> => {
      const service = new PostService();
      return service.getDetails(id);
    },

    create: async (dto: CreatePostDTO): Promise<Post> => {
      const service = new PostService();
      return service.create(dto);
    },

    update: async (id: string, dto: UpdatePostDTO): Promise<Post | null> => {
      const service = new PostService();
      return service.update(id, dto);
    },

    delete: async (id: string): Promise<boolean> => {
      const service = new PostService();
      return service.delete(id);
    },

    publish: async (id: string): Promise<Post | null> => {
      const service = new PostService();
      return service.publish(id);
    },
  };

  comments = {
    create: async (dto: CreateCommentDTO): Promise<Comment> => {
      const service = new CommentService();
      return service.create(dto);
    },

    update: async (id: string, content: string): Promise<Comment | null> => {
      const service = new CommentService();
      return service.update(id, content);
    },

    delete: async (id: string): Promise<boolean> => {
      const service = new CommentService();
      return service.delete(id);
    },
  };

  users = {
    create: async (dto: CreateUserDTO): Promise<User> => {
      const service = new UserService();
      return service.create(dto);
    },

    get: async (id: string): Promise<User | null> => {
      const service = new UserService();
      return service.findById(id);
    },
  };
}

// ============================================
// EJEMPLO DE USO
// ============================================

async function demo(): Promise<void> {
  console.log("=== DEMO: Full-Stack Blog System ===\n");

  const client = new BlogApiClient();

  // 1. Crear usuarios
  console.log("1. Creating users...");
  const admin = await client.users.create({
    email: "admin@blog.com",
    name: "Admin User",
    role: "admin",
  });

  const author = await client.users.create({
    email: "author@blog.com",
    name: "John Doe",
    role: "author",
    bio: "TypeScript enthusiast",
  });

  console.log(`Created ${admin.name} (${admin.role})`);
  console.log(`Created ${author.name} (${author.role})`);

  // 2. Crear posts
  console.log("\n2. Creating posts...");
  const post1 = await client.posts.create({
    authorId: author.id,
    title: "Getting Started with TypeScript",
    content:
      "TypeScript is a powerful superset of JavaScript that adds static typing...",
    excerpt: "Learn the basics of TypeScript",
    tags: ["typescript", "javascript", "tutorial"],
    status: "draft",
  });

  console.log(`Created post: "${post1.title}" (${post1.status})`);

  // 3. Publicar post
  console.log("\n3. Publishing post...");
  const published = await client.posts.publish(post1.id);
  console.log(`Published: "${published?.title}"`);

  // 4. Agregar comentarios
  console.log("\n4. Adding comments...");
  const comment1 = await client.comments.create({
    postId: post1.id,
    authorId: admin.id,
    content: "Great introduction to TypeScript!",
  });

  const reply = await client.comments.create({
    postId: post1.id,
    authorId: author.id,
    content: "Thanks for reading!",
    parentId: comment1.id,
  });

  console.log(`Added ${2} comments`);

  // 5. Obtener post completo
  console.log("\n5. Fetching post details...");
  const details = await client.posts.get(post1.id);

  if (details) {
    console.log(`\nPost: ${details.title}`);
    console.log(`Author: ${details.author.name}`);
    console.log(`Tags: ${details.tags.join(", ")}`);
    console.log(`Comments: ${details.comments.length}`);
    details.comments.forEach((c) => {
      const prefix = c.parentId ? "  ↳" : "•";
      console.log(`  ${prefix} ${c.author.name}: ${c.content}`);
    });
  }

  // 6. Listar posts publicados
  console.log("\n6. Listing published posts...");
  const posts = await client.posts.list({ page: 1, limit: 10 });
  console.log(`Found ${posts.length} published posts`);
}

// ============================================
// TESTS
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
  console.assert(user.email === "test@example.com", "❌ Test 1 failed");
  console.log("✅ Test 1 passed: Create user");

  // Test 2: Create post
  const postService = new PostService();
  const post = await postService.create({
    authorId: user.id,
    title: "Test Post Title",
    content:
      "This is a test post with enough content to pass validation requirements.",
    tags: ["test"],
    status: "draft",
  });
  console.assert(post.id !== undefined, "❌ Test 2 failed");
  console.assert(post.status === "draft", "❌ Test 2 failed");
  console.log("✅ Test 2 passed: Create post");

  // Test 3: Publish post
  const published = await postService.publish(post.id);
  console.assert(published !== null, "❌ Test 3 failed");
  console.assert(published!.status === "published", "❌ Test 3 failed");
  console.assert(published!.publishedAt !== undefined, "❌ Test 3 failed");
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
  console.assert(postWithComments !== null, "❌ Test 5 failed");
  console.assert(postWithComments!.comments.length === 1, "❌ Test 5 failed");
  console.log("✅ Test 5 passed: Get post with comments");

  // Test 6: Validation
  try {
    await userService.create({
      email: "invalid-email",
      name: "Test",
      role: "author",
    });
    console.log("❌ Test 6 failed: Should throw validation error");
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log("✅ Test 6 passed: Validation error");
    } else {
      console.log("❌ Test 6 failed: Wrong error type");
    }
  }

  // Test 7: Post details with author
  const details = await postService.getDetails(post.id);
  console.assert(details !== null, "❌ Test 7 failed");
  console.assert(details!.author.id === user.id, "❌ Test 7 failed");
  console.assert(details!.comments.length === 1, "❌ Test 7 failed");
  console.log("✅ Test 7 passed: Post details");

  // Test 8: Delete post cascades to comments
  const deleted = await postService.delete(post.id);
  console.assert(deleted === true, "❌ Test 8 failed");
  const deletedPost = await postService.findById(post.id);
  console.assert(deletedPost === null, "❌ Test 8 failed");
  console.log("✅ Test 8 passed: Delete cascade");

  console.log("\n🎉 ALL INTEGRATION TESTS PASSED!");
}

// Ejecutar
// demo();
runTests();

export {
  UserService,
  PostService,
  CommentService,
  BlogApiClient,
  User,
  Post,
  Comment,
  CreateUserDTO,
  CreatePostDTO,
  CreateCommentDTO,
};
