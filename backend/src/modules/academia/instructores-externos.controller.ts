import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { InstructoresExternosService } from './instructores-externos.service';
import { InstructorExternoDto } from './dto/instructor-externo.dto';

@ApiTags('academia/instructores-externos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academia/instructores-externos')
export class InstructoresExternosController {
  constructor(private readonly service: InstructoresExternosService) {}

  @Get()
  @RequirePermission('academia:ver')
  findAll(@Query('q') q?: string) {
    return this.service.findAll(q);
  }

  @Get(':id')
  @RequirePermission('academia:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('academia:gestionar_instructores')
  create(@Body() dto: InstructorExternoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermission('academia:gestionar_instructores')
  update(@Param('id') id: string, @Body() dto: Partial<InstructorExternoDto>) {
    return this.service.update(id, dto);
  }
}
