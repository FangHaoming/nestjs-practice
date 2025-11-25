import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '@nestjs-practice/auth';
import { CreatePostDto, UpdatePostDto } from '@nestjs-practice/shared';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search posts by keyword' })
  @ApiResponse({ status: 200, description: 'List of matching posts' })
  @ApiQuery({ name: 'keyword', required: true, description: 'Search keyword' })
  search(@Query('keyword') keyword: string) {
    return this.postsService.search(keyword);
  }

  @Get('drafts')
  @ApiOperation({ summary: 'Get user draft posts' })
  @ApiResponse({ status: 200, description: 'List of user draft posts' })
  findDrafts(@Request() req) {
    return this.postsService.findDrafts(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  @ApiResponse({ status: 200, description: 'List of published posts' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Search keyword for posts' })
  findAll(@Query('keyword') keyword?: string) {
    if (keyword) {
      return this.postsService.search(keyword);
    }
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only update your own posts' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postsService.update(id, updatePostDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only delete your own posts' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postsService.remove(id, req.user.id, req.user.role);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish post' })
  @ApiResponse({ status: 200, description: 'Post published successfully' })
  publish(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postsService.publish(id, req.user.id, req.user.role);
  }
}