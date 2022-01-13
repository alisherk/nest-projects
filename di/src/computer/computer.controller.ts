import { Controller, Get } from '@nestjs/common';
import { CpuService } from '../cpu/cpu.service';
import { DiskService } from '../disk/disk.service';

@Controller('computer')
export class ComputerController {
  constructor(
    private cpuSevice: CpuService,
    private diskService: DiskService,
  ) {}

  @Get()
  run() {
    return [this.cpuSevice.compute(1, 2), this.diskService.getData()];
  }
}
