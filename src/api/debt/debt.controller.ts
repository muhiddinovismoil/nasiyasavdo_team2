import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { DebtService } from './debt.service';
import { UpdateDebtDto, CreateDebtDto } from './dto';
import { JwtGuard } from '../../common';

@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  description: 'Bearer token for authentication',
})
@ApiTags('Debt API')
@UseGuards(JwtGuard)
@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @ApiOperation({
    summary: 'Create debt',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Debt created',
    schema: {
      example: {
        status_code: HttpStatus.CREATED,
        message: 'success',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed creating debt',
    schema: {
      example: {
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Error on creating debt',
      },
    },
  })
  @Post()
  create(@Body() createDebtDto: CreateDebtDto) {
    return this.debtService.createDebt(createDebtDto);
  }

  @ApiOperation({
    summary: 'Get all debts',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All debts fetched successfully',
    schema: {
      example: {
        status_code: HttpStatus.OK,
        message: 'success',
        data: [
          {
            id: 'b2d4aa27-0768-4456-947f-f8930c294394',
            created_at: '1730288822952',
            updated_at: '1730288797974',
            debtor_id: 'b2d4aa27-0768-4456-947f-f8930c294394',
            debt_date: '1730288822952',
            debt_period: '6',
            debt_sum: '1000.00',
            description: 'description',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed fetching debts',
    schema: {
      example: {
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Error on fetching debts',
      },
    },
  })
  @Get()
  findAll() {
    return this.debtService.findAllDebts();
  }

  @Get('find-pagination')
  findAllWithPaginations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.debtService.getAllMessages(page, limit);
  }

  @ApiOperation({
    summary: 'Get debt by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the debt',
    type: String,
    example: 'b2d4aa27-0768-4456-947f-f8930c294394',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Debt fetched by id successfully',
    schema: {
      example: {
        status_code: HttpStatus.OK,
        message: 'success',
        data: {
          id: 'b2d4aa27-0768-4456-947f-f8930c294394',
          created_at: '1730288822952',
          updated_at: '1730288797974',
          debtor_id: 'b2d4aa27-0768-4456-947f-f8930c294394',
          debt_date: '1730288822952',
          debt_period: '12',
          debt_sum: '1000.00',
          description: 'description',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed fetching debt by ID',
    schema: {
      example: {
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Error on fetching debt by ID',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.debtService.findOneDebtById(id);
  }

  @ApiOperation({
    summary: 'Edit debt',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the debt',
    type: String,
    example: 'b2d4aa27-0768-4456-947f-f8930c294394',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Debt edited',
    schema: {
      example: {
        status_code: HttpStatus.OK,
        message: 'success',
        data: {},
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed edit debt',
    schema: {
      example: {
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Error on update debt',
      },
    },
  })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDebtDto: UpdateDebtDto,
  ) {
    return this.debtService.updateDebtById(id, updateDebtDto);
  }

  @ApiOperation({
    summary: 'Delete debt by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of debt',
    type: String,
    example: 'b2d4aa27-0768-4456-947f-f8930c294394',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Debt by ID deleted successfully',
    schema: {
      example: {
        status_code: HttpStatus.OK,
        message: 'success',
        data: {},
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed delete debt by ID',
    schema: {
      example: {
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Error on deleting debt by ID',
      },
    },
  })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.debtService.deleteDebtById(id);
  }

  // image

  @Post('image/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/debts',
        filename: (req, file, callback) => {
          const ext = extname(file.originalname);
          callback(null, `${file.originalname}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|heic)$/)) {
          return callback(
            new BadRequestException(
              'Only image files are allowed! Like: .jpg .jpeg .png .gif .heic',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  createDebtImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.debtService.createDebtImage(id, file);
  }

  @Get('images/:id')
  findImagesById(@Param('id', ParseUUIDPipe) id: string) {
    return this.debtService.findDebtImages(id);
  }
}
