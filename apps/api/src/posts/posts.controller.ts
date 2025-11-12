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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '@nestjs-practice/auth';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  create(@Body() createPostDto: any, @Request() req) {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  @ApiResponse({ status: 200, description: 'List of published posts' })
  findAll() {
    return this.postsService.findAll();
  }

  @Get('drafts')
  @ApiOperation({ summary: 'Get user draft posts' })
  @ApiResponse({ status: 200, description: 'List of user draft posts' })
  findDrafts(@Request() req) {
    return this.postsService.findDrafts(req.user.id);
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: any,
    @Request() req,
  ) {
    return this.postsService.update(id, updatePostDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
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