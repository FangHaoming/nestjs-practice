import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, User } from '@nestjs-practice/shared';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createPostDto: any, authorId: number): Promise<Post> {
    const author = await this.userRepository.findOne({
      where: { id: authorId },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const post = this.postRepository.create({
      ...createPostDto,
      author,
    });

    const savedPost = await this.postRepository.save(post);
    return Array.isArray(savedPost) ? savedPost[0] : savedPost;
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['author'],
      where: { isPublished: true },
    });
  }

  async findDrafts(authorId: number): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['author'],
      where: { author: { id: authorId }, isPublished: false },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: any, userId: number, userRole: string): Promise<Post> {
    const post = await this.findOne(id);

    if (post.author.id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only update your own posts');
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: number, userId: number, userRole: string): Promise<void> {
    const post = await this.findOne(id);

    if (post.author.id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
  }

  async publish(id: number, userId: number, userRole: string): Promise<Post> {
    const post = await this.findOne(id);

    if (post.author.id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only publish your own posts');
    }

    post.isPublished = true;
    return this.postRepository.save(post);
  }
}